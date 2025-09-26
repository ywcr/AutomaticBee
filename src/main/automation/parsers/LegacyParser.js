/**
 * LegacyParser - 基于统一自动化脚本的Excel解析器
 * 完全兼容统一自动化脚本_模块化版.html中的解析逻辑
 */

const XLSX = require('xlsx');
const { EventEmitter } = require('events');

class LegacyParser extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // 问卷类型配置 - 与统一脚本保持一致
        this.questionnaireTypes = {
            liuwei_patient: {
                name: "六味患者问卷",
                contactType: "患者",
                sheetName: "六味患者问卷",
                keywords: ["六味", "患者", "问卷"],
                hasChannel: false,
                columnFormat: "simple", // 无渠道：序号, 姓名, 性别, 时间, 指派人
                labelName: "患者姓名"
            },
            xihuang_consumer: {
                name: "西黄消费者问卷",
                contactType: "消费者",
                sheetName: "西黄消费者问卷",
                keywords: ["西黄", "消费者", "问卷"],
                hasChannel: true,
                columnFormat: "simple", // 简单格式：序号, 消费者姓名, 性别, 时间, 指派人
                labelName: "消费者姓名"
            },
            niujie_consumer: {
                name: "牛解消费者问卷",
                contactType: "消费者",
                sheetName: "牛解消费者问卷",
                keywords: ["牛解", "消费者", "问卷"],
                hasChannel: true,
                columnFormat: "simple",
                labelName: "消费者姓名"
            },
            zhibai_consumer: {
                name: "知柏消费者问卷",
                contactType: "消费者",
                sheetName: "知柏消费者问卷",
                keywords: ["知柏", "消费者", "问卷"],
                hasChannel: true,
                columnFormat: "simple",
                labelName: "消费者姓名"
            },
            tiegao_patient: {
                name: "贴膏患者问卷",
                contactType: "患者",
                sheetName: "贴膏患者问卷",
                keywords: ["贴膏", "患者", "问卷"],
                hasChannel: false,
                columnFormat: "simple",
                labelName: "患者姓名"
            }
        };

        // 产品关键词配置
        this.productKeywords = ["六味", "西黄", "牛解", "知柏", "贴膏"];
        
        // 预览配置
        this.previewRows = 6;
        this.maxPreviewData = 10;
        
        this.sheets = {};
    }

    /**
     * 处理Excel文件 - 主入口方法
     */
    async processExcelFile(filePath, questionnaireType = null) {
        try {
            console.log(`📊 开始解析Excel文件: ${filePath}`);
            
            // 加载Excel文件
            const { sheets, sheetNames } = await this.loadExcelFile(filePath);
            this.sheets = sheets;

            let targetQuestionnaireType = questionnaireType;
            let selectedSheetName = null;

            // 如果未指定问卷类型，尝试自动识别
            if (!targetQuestionnaireType) {
                const detectionResult = this.detectQuestionnaireType(sheetNames);
                if (detectionResult.found) {
                    targetQuestionnaireType = detectionResult.type;
                    selectedSheetName = detectionResult.sheetName;
                    console.log(`🎯 自动识别问卷类型: ${detectionResult.type} (工作表: ${selectedSheetName})`);
                }
            }

            if (!targetQuestionnaireType) {
                throw new Error(`无法识别问卷类型。可用工作表: [${sheetNames.join(', ')}]`);
            }

            const config = this.questionnaireTypes[targetQuestionnaireType];
            if (!config) {
                throw new Error(`不支持的问卷类型: ${targetQuestionnaireType}`);
            }

            // 查找匹配的工作表
            if (!selectedSheetName) {
                const matchResult = this.findMatchingSheet(sheets, config);
                if (!matchResult.found) {
                    throw new Error(`未找到匹配的工作表: ${matchResult.reason}`);
                }
                selectedSheetName = matchResult.sheetName;
            }

            console.log(`✅ 使用工作表: ${selectedSheetName}`);

            // 解析工作表数据
            const sheetData = sheets[selectedSheetName];
            const parsedData = this.parseSheetData(sheetData, config);

            // 按指派人分组
            const assigneeData = this.groupByAssignee(parsedData.data);

            // 收集所有日期
            const allDates = this.getAllDates(parsedData.data);

            const result = {
                questionnaireType: targetQuestionnaireType,
                config: config,
                data: parsedData.data,
                assigneeData: assigneeData,
                allDates: allDates,
                stats: {
                    totalRecords: parsedData.data.length,
                    assigneeCount: Object.keys(assigneeData).length,
                    dateCount: allDates.length,
                    invalidRows: parsedData.invalidRows,
                    duplicateRows: parsedData.duplicateRows
                },
                meta: {
                    fileName: filePath.split(/[\\/]/).pop(),
                    sheetName: selectedSheetName,
                    processedAt: new Date().toISOString()
                }
            };

            console.log(`🎉 Excel解析完成，总计 ${result.stats.totalRecords} 条记录`);
            this.emit('parseCompleted', result);
            
            return result;

        } catch (error) {
            console.error(`❌ Excel解析失败:`, error);
            this.emit('parseError', error);
            throw error;
        }
    }

    /**
     * 加载Excel文件
     */
    async loadExcelFile(filePath) {
        try {
            const fs = require('fs');
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`文件不存在: ${filePath}`);
            }

            const fileBuffer = fs.readFileSync(filePath);
            const workbook = XLSX.read(fileBuffer, { 
                type: 'buffer',
                cellDates: true,
                cellNF: false,
                cellText: false
            });

            const sheets = {};
            for (const sheetName of workbook.SheetNames) {
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    header: 1,
                    raw: false,
                    dateNF: 'MM.DD'
                });
                sheets[sheetName] = sheet;
            }

            console.log(`📋 工作表加载完成: [${workbook.SheetNames.join(', ')}]`);

            return {
                sheets: sheets,
                sheetNames: workbook.SheetNames
            };

        } catch (error) {
            throw new Error(`文件加载失败: ${error.message}`);
        }
    }

    /**
     * 自动检测问卷类型
     */
    detectQuestionnaireType(sheetNames) {
        console.log(`🔍 自动检测问卷类型...`);
        console.log(`📋 可用工作表: [${sheetNames.join(', ')}]`);

        // 遍历所有问卷类型配置
        for (const [typeKey, config] of Object.entries(this.questionnaireTypes)) {
            console.log(`🔍 检测类型: ${config.name}`);
            console.log(`   关键词: [${config.keywords.join(', ')}]`);

            // 精确匹配
            if (sheetNames.includes(config.sheetName)) {
                console.log(`✅ 精确匹配成功: ${config.sheetName}`);
                return {
                    found: true,
                    type: typeKey,
                    sheetName: config.sheetName,
                    reason: 'exact_match'
                };
            }

            // 模糊匹配
            const fuzzyMatch = this.findFuzzyMatch(sheetNames, config.keywords);
            if (fuzzyMatch) {
                console.log(`✅ 模糊匹配成功: ${fuzzyMatch}`);
                return {
                    found: true,
                    type: typeKey,
                    sheetName: fuzzyMatch,
                    reason: 'fuzzy_match'
                };
            }
        }

        console.log(`❌ 未能自动识别问卷类型`);
        return {
            found: false,
            reason: `未找到包含产品关键词 [${this.productKeywords.join(', ')}] 的工作表`
        };
    }

    /**
     * 查找匹配的工作表
     */
    findMatchingSheet(sheets, config) {
        const sheetNames = Object.keys(sheets);
        
        console.log(`🔍 查找匹配工作表，问卷类型: ${config.name}`);
        console.log(`📋 可用工作表: [${sheetNames.join(', ')}]`);

        // 精确匹配
        if (sheets[config.sheetName]) {
            return {
                found: true,
                sheetName: config.sheetName,
                reason: 'exact_match'
            };
        }

        // 模糊匹配
        const fuzzyMatch = this.findFuzzyMatch(sheetNames, config.keywords);
        if (fuzzyMatch) {
            return {
                found: true,
                sheetName: fuzzyMatch,
                reason: 'fuzzy_match'
            };
        }

        return {
            found: false,
            reason: `未找到包含关键词 [${config.keywords.join(', ')}] 的工作表`
        };
    }

    /**
     * 模糊匹配工作表名
     */
    findFuzzyMatch(sheetNames, keywords) {
        let bestMatch = null;
        let maxScore = 0;

        const currentProductKeyword = keywords.find(k => 
            this.productKeywords.includes(k)
        );

        console.log(`🔍 模糊匹配详情：`);
        console.log(`   产品关键词: ${currentProductKeyword || '无'}`);

        for (const sheetName of sheetNames) {
            let score = 0;
            let hasProductKeyword = false;
            let matchedKeywords = [];

            for (const keyword of keywords) {
                if (sheetName.includes(keyword)) {
                    score++;
                    matchedKeywords.push(keyword);
                    if (this.productKeywords.includes(keyword)) {
                        hasProductKeyword = true;
                    }
                }
            }

            console.log(`   "${sheetName}": 得分${score}, 产品关键词${hasProductKeyword ? '✅' : '❌'}, 匹配词[${matchedKeywords.join(', ')}]`);

            if (hasProductKeyword && score > maxScore) {
                maxScore = score;
                bestMatch = sheetName;
            }
        }

        console.log(`🎯 最佳匹配: ${bestMatch || '无'} (得分: ${maxScore})`);

        return maxScore >= 2 && bestMatch ? bestMatch : null;
    }

    /**
     * 解析工作表数据
     */
    parseSheetData(sheetData, config) {
        console.log(`📊 开始解析工作表数据，问卷类型: ${config.name}`);
        
        if (!sheetData || sheetData.length === 0) {
            throw new Error('工作表数据为空');
        }

        const dataRows = sheetData.slice(1); // 跳过标题行
        const parsedData = [];
        const invalidRows = [];
        const duplicateRows = [];
        const processedKeys = new Set(); // 用于检测重复

        console.log(`📝 数据行数: ${dataRows.length}`);

        dataRows.forEach((row, index) => {
            try {
                if (!row || row.length === 0) return;

                const item = this.parseRow(row, index, config);
                if (item) {
                    // 生成唯一键用于重复检测
                    const uniqueKey = `${item.name}_${item.time}_${item.assignee}`;
                    
                    if (processedKeys.has(uniqueKey)) {
                        duplicateRows.push({
                            row: index + 2, // +2 因为跳过标题行且Excel行号从1开始
                            data: item,
                            reason: '重复记录'
                        });
                        return;
                    }

                    processedKeys.add(uniqueKey);
                    parsedData.push(item);
                }
            } catch (error) {
                invalidRows.push({
                    row: index + 2,
                    data: row,
                    error: error.message
                });
            }
        });

        console.log(`✅ 解析完成: 有效${parsedData.length}条, 无效${invalidRows.length}条, 重复${duplicateRows.length}条`);

        return {
            data: parsedData,
            invalidRows: invalidRows,
            duplicateRows: duplicateRows
        };
    }

    /**
     * 解析单行数据 - 与统一脚本的parseRow逻辑保持一致
     */
    parseRow(row, index, config) {
        const item = {};

        // 根据问卷类型解析不同的列
        if (config.contactType === "患者") {
            if (config.columnFormat === "simple") {
                // 简单格式：序号, 姓名, 性别, 时间, 指派人
                item.name = row[1] || `患者${index + 1}`;
                item.sex = row[2] || "男";
                item.time = row[3] || "";
                item.assignee = row[4] || "未指派";
            } else {
                // 完整格式：姓名, 性别, 时间, 指派人
                item.name = row[0] || `患者${index + 1}`;
                item.sex = row[1] || "男";
                item.time = row[2] || "";
                item.assignee = row[3] || "未指派";
            }
        } else {
            // 消费者问卷
            if (config.columnFormat === "simple") {
                // 简单格式：序号, 消费者姓名, 性别, 时间, 指派人
                item.name = row[1] || `消费者${index + 1}`;
                item.sex = row[2] || "男";
                item.hospital = "";
                item.address = "";
                item.time = row[3] || "";
                item.assignee = row[4] || "未指派";
            } else {
                // 完整格式：消费者姓名, 性别, 医院, 地址, 时间, 指派人
                item.name = row[0] || `消费者${index + 1}`;
                item.sex = row[1] || "男";
                item.hospital = row[2] || "";
                item.address = row[3] || "";
                item.time = row[4] || "";
                item.assignee = row[5] || "未指派";
            }
        }

        // 数据清理和格式化
        item.time = this.formatDate(item.time);
        if (item.assignee) {
            item.assignee = item.assignee.toString().trim();
        }

        // 验证必要字段
        if (!item.name || !item.assignee || !item.time) {
            throw new Error(`缺少必要字段: name=${item.name}, assignee=${item.assignee}, time=${item.time}`);
        }

        // 添加额外的元数据
        item.questionnaireType = config.name;
        item.contactType = config.contactType;
        item.hasChannel = config.hasChannel;
        item.rowIndex = index + 2; // Excel行号

        return item;
    }

    /**
     * 格式化日期 - 与统一脚本的日期处理逻辑保持一致
     */
    formatDate(dateValue) {
        if (!dateValue) return "";

        // 转换为字符串
        const dateStr = dateValue.toString().trim();
        if (!dateStr) return "";

        // 处理 MM.DD 格式
        const parts = dateStr.split('.');
        if (parts.length === 2) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            return `${month}.${day}`;
        }

        // 处理其他日期格式
        const datePatterns = [
            /^(\d{1,2})\.(\d{1,2})$/,           // MM.DD
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/,   // YYYY-MM-DD
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
            /^(\d{1,2})-(\d{1,2})$/            // MM-DD
        ];

        for (const pattern of datePatterns) {
            const match = dateStr.match(pattern);
            if (match) {
                if (pattern.toString().includes('YYYY')) {
                    // 包含年份的格式，转换为 MM.DD
                    const month = match[2].padStart(2, '0');
                    const day = match[3].padStart(2, '0');
                    return `${month}.${day}`;
                } else {
                    // 仅月日格式
                    const month = match[1].padStart(2, '0');
                    const day = match[2].padStart(2, '0');
                    return `${month}.${day}`;
                }
            }
        }

        // 如果无法识别格式，返回原值
        console.warn(`⚠️ 无法识别日期格式: ${dateStr}`);
        return dateStr;
    }

    /**
     * 按指派人分组数据
     */
    groupByAssignee(data) {
        const grouped = {};

        data.forEach(item => {
            const assignee = item.assignee;
            if (!grouped[assignee]) {
                grouped[assignee] = [];
            }
            grouped[assignee].push(item);
        });

        console.log(`👥 按指派人分组完成: ${Object.keys(grouped).length} 个指派人`);
        Object.keys(grouped).forEach(assignee => {
            console.log(`   ${assignee}: ${grouped[assignee].length} 条记录`);
        });

        return grouped;
    }

    /**
     * 收集所有日期
     */
    getAllDates(data) {
        const dateSet = new Set();
        
        data.forEach(item => {
            if (item.time) {
                dateSet.add(item.time);
            }
        });

        const allDates = Array.from(dateSet).sort();
        console.log(`📅 收集到 ${allDates.length} 个唯一日期: [${allDates.join(', ')}]`);

        return allDates;
    }

    /**
     * 获取数据预览
     */
    getDataPreview(data, maxRows = null) {
        const previewRows = maxRows || this.previewRows;
        const preview = data.slice(0, previewRows);
        
        return {
            preview: preview,
            total: data.length,
            hasMore: data.length > previewRows
        };
    }

    /**
     * 验证数据完整性
     */
    validateData(data) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            stats: {
                totalRecords: data.length,
                missingNames: 0,
                missingDates: 0,
                missingAssignees: 0,
                duplicateEntries: 0
            }
        };

        const uniqueKeys = new Set();

        data.forEach((item, index) => {
            const issues = [];

            // 检查必要字段
            if (!item.name || item.name.trim() === '') {
                issues.push('缺少姓名');
                validation.stats.missingNames++;
            }

            if (!item.time || item.time.trim() === '') {
                issues.push('缺少时间');
                validation.stats.missingDates++;
            }

            if (!item.assignee || item.assignee.trim() === '') {
                issues.push('缺少指派人');
                validation.stats.missingAssignees++;
            }

            // 检查重复
            const uniqueKey = `${item.name}_${item.time}_${item.assignee}`;
            if (uniqueKeys.has(uniqueKey)) {
                issues.push('重复记录');
                validation.stats.duplicateEntries++;
            } else {
                uniqueKeys.add(uniqueKey);
            }

            if (issues.length > 0) {
                validation.errors.push({
                    row: index + 1,
                    issues: issues,
                    data: item
                });
                validation.isValid = false;
            }
        });

        return validation;
    }
}

module.exports = LegacyParser;