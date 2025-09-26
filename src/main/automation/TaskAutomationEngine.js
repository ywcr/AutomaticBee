/**
 * 任务自动化引擎
 * 整合问卷自动化功能，支持 Excel 数据处理、API 调用、批量任务执行
 */

const EventEmitter = require("events");
const XLSX = require("xlsx");
const LegacyParser = require("./parsers/LegacyParser");

class TaskAutomationEngine extends EventEmitter {
  constructor(apiManager) {
    super();
    this.apiManager = apiManager;
    
    // 初始化LegacyParser
    this.legacyParser = new LegacyParser();
    this.bindParserEvents();
    this.isRunning = false;
    this.isPaused = false;
    this.currentTask = null;
    this.taskQueue = [];
    this.results = {
      successful: [],
      failed: [],
      skipped: [],
    };

    // 配置参数
    this.config = {
      concurrency: 1,
      retryAttempts: 3,
      retryDelay: 2000,
      stepDelay: 1500,
      timeout: 30000,
    };
  }

  /**
   * 绑定LegacyParser事件
   */
  bindParserEvents() {
    this.legacyParser.on('parseCompleted', (result) => {
      console.log('🎉 LegacyParser 解析完成:', result.stats);
      this.emit('parseCompleted', result);
    });

    this.legacyParser.on('parseError', (error) => {
      console.error('❌ LegacyParser 解析失败:', error);
      this.emit('parseError', error);
    });
  }

  /**
   * 处理 Excel 数据 - 使用LegacyParser
   * @param {string} filePath - Excel 文件路径
   * @param {string} questionnaireType - 问卷类型（可选）
   * @param {string} startDate - 开始日期 (MM.DD)
   * @param {string} endDate - 结束日期 (MM.DD)
   * @returns {Object} 处理后的数据
   */
  async processExcelData(filePath, questionnaireType = null, startDate = null, endDate = null) {
    try {
      console.log("📈 开始使用LegacyParser处理 Excel 文件:", filePath);

      // 使用LegacyParser解析Excel文件
      const parseResult = await this.legacyParser.processExcelFile(filePath, questionnaireType);
      
      // 应用日期过滤（如果指定）
      let filteredData = parseResult.assigneeData;
      if (startDate || endDate) {
        filteredData = this.applyDateFilterLegacy(parseResult.assigneeData, startDate, endDate);
      }
      
      // 计算过滤后的统计信息
      const filteredStats = this.calculateStatsLegacy(filteredData);

      this.emit("dataProcessed", { 
        parseResult, 
        filteredData, 
        stats: filteredStats 
      });

      console.log("🎉 Excel 文件处理完成, 统计信息:", filteredStats);

      return {
        // 原始解析结果
        parseResult: parseResult,
        // 兼容字段
        groupedData: parseResult.assigneeData,
        filteredData: filteredData,
        stats: filteredStats,
        // 新字段
        questionnaireType: parseResult.questionnaireType,
        config: parseResult.config,
        allDates: parseResult.allDates
      };
    } catch (error) {
      console.error("❌ Excel 数据处理失败:", error);
      this.emit("error", { type: "dataProcessing", error });
      throw error;
    }
  }

  /**
   * 读取 Excel 文件 (Node.js 环境)
   */
  async readExcelFile(filePath) {
    try {
      const fs = require("fs");

      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 读取文件
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });

      console.log("Excel 文件读取成功, 工作表:", Object.keys(workbook.Sheets));
      return workbook;
    } catch (error) {
      throw new Error(`Excel 文件读取失败: ${error.message}`);
    }
  }

  /**
   * 从工作簿提取数据
   */
  extractDataFromWorkbook(workbook) {
    const data = [];

    // 支持的工作表名称
    const supportedSheets = ["六味患者问卷", "西黄消费者问卷"];

    for (const sheetName of supportedSheets) {
      if (workbook.Sheets[sheetName]) {
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });
        const rows = sheetData.slice(1); // 跳过标题行

        const questionnaireType = sheetName.includes("六味")
          ? "liuwei_patient"
          : "xihuang_consumer";
        const nameField = sheetName.includes("六味") ? "患者" : "消费者";

        rows.forEach((row) => {
          const [序号, 姓名, 性别, 时间, 指派人] = row;
          if (姓名 && 指派人 && 时间) {
            data.push({
              序号,
              姓名,
              性别,
              时间: this.formatTime(时间),
              指派人,
              questionnaireType,
              nameField,
            });
          }
        });
      }
    }

    return data;
  }

  /**
   * Legacy模式日期过滤 - 兼容MM.DD格式
   */
  applyDateFilterLegacy(assigneeData, startDate, endDate) {
    if (!startDate && !endDate) {
      return assigneeData;
    }

    console.log(`📅 应用日期过滤: ${startDate || '无'} ~ ${endDate || '无'}`);

    const filtered = {};

    Object.keys(assigneeData).forEach(assignee => {
      const filteredItems = assigneeData[assignee].filter(item => {
        if (!item.time) return false;

        // MM.DD 格式比较
        const itemDate = item.time; // 已经是 MM.DD 格式
        
        if (startDate && this.compareDateStrings(itemDate, startDate) < 0) return false;
        if (endDate && this.compareDateStrings(itemDate, endDate) > 0) return false;

        return true;
      });

      if (filteredItems.length > 0) {
        filtered[assignee] = filteredItems;
      }
    });

    console.log(`✅ 过滤完成: ${Object.keys(filtered).length} 个指派人`);
    return filtered;
  }

  /**
   * 比较两个 MM.DD 格式的日期字符串
   * @param {string} date1 - MM.DD
   * @param {string} date2 - MM.DD
   * @returns {number} -1, 0, 1
   */
  compareDateStrings(date1, date2) {
    if (!date1 || !date2) return 0;
    
    const [month1, day1] = date1.split('.').map(n => parseInt(n, 10));
    const [month2, day2] = date2.split('.').map(n => parseInt(n, 10));
    
    if (month1 !== month2) {
      return month1 - month2;
    }
    
    return day1 - day2;
  }

  /**
   * Legacy模式统计信息计算
   */
  calculateStatsLegacy(assigneeData) {
    const stats = {
      totalAssignees: Object.keys(assigneeData).length,
      totalRecords: 0,
      assigneeStats: {},
      dateRange: null,
    };

    const allDates = [];

    Object.keys(assigneeData).forEach(assignee => {
      const items = assigneeData[assignee];
      stats.totalRecords += items.length;

      const assigneeDates = items
        .map(item => item.time)
        .filter(Boolean)
        .sort((a, b) => this.compareDateStrings(a, b));

      stats.assigneeStats[assignee] = {
        count: items.length,
        dateRange: assigneeDates.length > 0 ? {
          start: assigneeDates[0],
          end: assigneeDates[assigneeDates.length - 1]
        } : null,
      };

      allDates.push(...assigneeDates);
    });

    if (allDates.length > 0) {
      const sortedDates = [...new Set(allDates)].sort((a, b) => this.compareDateStrings(a, b));
      stats.dateRange = {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1]
      };
    }

    return stats;
  }

  /**
   * 格式化时间
   */
  formatTime(timeStr) {
    if (!timeStr) return null;

    // 处理 MM.DD 格式
    const parts = timeStr.toString().split(".");
    if (parts.length === 2) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const year = new Date().getFullYear();
      return {
        original: timeStr,
        formatted: `${month}.${day}`,
        fullDate: `${year}-${month}-${day}`,
      };
    }

    return {
      original: timeStr,
      formatted: timeStr,
      fullDate: null,
    };
  }

  /**
   * 按指派人分组数据
   */
  groupDataByAssignee(data) {
    const grouped = {};

    data.forEach((item) => {
      const assignee = item.指派人;
      if (!grouped[assignee]) {
        grouped[assignee] = [];
      }
      grouped[assignee].push(item);
    });

    return grouped;
  }

  /**
   * 应用日期过滤
   */
  applyDateFilter(groupedData, startDate, endDate) {
    if (!startDate && !endDate) {
      return groupedData;
    }

    const filtered = {};

    Object.keys(groupedData).forEach((assignee) => {
      const filteredItems = groupedData[assignee].filter((item) => {
        if (!item.时间 || !item.时间.fullDate) return false;

        const itemDate = new Date(item.时间.fullDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;

        return true;
      });

      if (filteredItems.length > 0) {
        filtered[assignee] = filteredItems;
      }
    });

    return filtered;
  }

  /**
   * 计算统计信息
   */
  calculateStats(filteredData) {
    const stats = {
      totalAssignees: Object.keys(filteredData).length,
      totalRecords: 0,
      assigneeStats: {},
      dateRange: null,
    };

    const allDates = [];

    Object.keys(filteredData).forEach((assignee) => {
      const items = filteredData[assignee];
      stats.totalRecords += items.length;

      const assigneeDates = items
        .map((item) => item.时间?.fullDate)
        .filter(Boolean)
        .sort();

      stats.assigneeStats[assignee] = {
        count: items.length,
        dateRange:
          assigneeDates.length > 0
            ? {
                start: assigneeDates[0],
                end: assigneeDates[assigneeDates.length - 1],
              }
            : null,
      };

      allDates.push(...assigneeDates);
    });

    if (allDates.length > 0) {
      const sortedDates = [...new Set(allDates)].sort();
      stats.dateRange = {
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1],
      };
    }

    return stats;
  }

  /**
   * 执行指派人任务
   * @param {string} assignee - 指派人
   * @param {string} questionnaireType - 问卷类型
   * @param {Array} data - 数据列表
   * @param {Object} options - 执行选项
   */
  async executeAssigneeTask(assignee, questionnaireType, data, options = {}) {
    try {
      this.isRunning = true;
      this.isPaused = false;
      this.currentTask = { assignee, questionnaireType, data, options };

      this.emit("taskStarted", {
        assignee,
        questionnaireType,
        total: data.length,
      });

      const results = {
        contacts: { successful: [], failed: [] },
        questionnaires: { successful: [], failed: [] },
      };

      // 执行联系人创建
      if (options.createContacts !== false) {
        this.emit("phaseStarted", { phase: "contacts", assignee });
        results.contacts = await this.createContacts(assignee, data);
      }

      // 执行问卷创建
      if (options.createQuestionnaires !== false) {
        this.emit("phaseStarted", { phase: "questionnaires", assignee });
        results.questionnaires = await this.createQuestionnaires(
          assignee,
          questionnaireType,
          data
        );
      }

      this.emit("taskCompleted", { assignee, results });
      return results;
    } catch (error) {
      this.emit("taskFailed", { assignee, error });
      throw error;
    } finally {
      this.isRunning = false;
      this.currentTask = null;
    }
  }

  /**
   * 创建联系人
   */
  async createContacts(assignee, data) {
    const results = { successful: [], failed: [] };

    for (let i = 0; i < data.length; i++) {
      if (!this.isRunning) break;

      while (this.isPaused) {
        await this.delay(200);
      }

      const item = data[i];
      this.emit("progress", {
        phase: "contacts",
        current: i + 1,
        total: data.length,
        item: item.name || item.姓名 || 'Unknown', // 兼容新旧格式
      });

      try {
        const result = await this.apiManager.createContact(item);
        results.successful.push({ item, result });
        this.emit("contactCreated", { item, result });
      } catch (error) {
        results.failed.push({ item, error });
        this.emit("contactFailed", { item, error });
      }

      await this.delay(this.config.stepDelay);
    }

    return results;
  }

  /**
   * 创建问卷
   */
  async createQuestionnaires(assignee, questionnaireType, data) {
    const results = { successful: [], failed: [] };

    for (let i = 0; i < data.length; i++) {
      if (!this.isRunning) break;

      while (this.isPaused) {
        await this.delay(200);
      }

      const item = data[i];
      this.emit("progress", {
        phase: "questionnaires",
        current: i + 1,
        total: data.length,
        item: item.name || item.姓名 || 'Unknown', // 兼容新旧格式
      });

      try {
        const result = await this.apiManager.createQuestionnaire(
          questionnaireType,
          item
        );
        results.successful.push({ item, result });
        this.emit("questionnaireCreated", { item, result });
      } catch (error) {
        results.failed.push({ item, error });
        this.emit("questionnaireFailed", { item, error });
      }

      await this.delay(this.config.stepDelay);
    }

    return results;
  }

  /**
   * 暂停执行
   */
  pause() {
    this.isPaused = true;
    this.emit("paused");
  }

  /**
   * 继续执行
   */
  resume() {
    this.isPaused = false;
    this.emit("resumed");
  }

  /**
   * 停止执行
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.emit("stopped");
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit("configUpdated", this.config);
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentTask: this.currentTask,
      queueLength: this.taskQueue.length,
      config: this.config,
    };
  }
}

module.exports = TaskAutomationEngine;
