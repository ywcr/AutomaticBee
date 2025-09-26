const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

/**
 * 配置管理器
 * 管理应用的所有配置项
 */
class ConfigManager extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.config = {
      // API配置
      api: {
        baseUrl: 'https://zxyy.ltd',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        endpoints: {
          // 用户相关
          getUserName: '/lgb/user/getUserName',
          isAuthenticated: '/lgb/user/isAuthenticated',
          
          // 任务相关
          taskTypes: '/lgb/workOrder/type/list',
          taskList: '/lgb/workOrder/mobile/history/list',
          questionnaireList: '/lgb/workOrder/mobile/list',
          submitRange: '/lgb/project/getSubmitRangeTime',
          
          // 联系人管理
          contactQuery: '/lgb/lxrgl/getMessage',
          contactSave: '/lgb/lxrgl/save',
          contactList: '/lgb/lxrgl/getList',
          
          // 渠道管理
          channelSave: '/lgb/qdkh/save',
          areaTree: '/lgb/system/area/tree',
          
          // 问卷创建
          createPatientQuestionnaire: '/lgb/hzwj/add',
          createConsumerQuestionnaire: '/lgb/xfzwj/add',
          createDynamicsSalt: '/lgb/payMerge/createDynamicsSalt'
        }
      },
      
      // 代理配置
      proxy: {
        enabled: true,
        port: 3000,
        host: '127.0.0.1'
      },
      
      // 执行配置
      execution: {
        concurrency: 3,
        stepDelay: 1000,
        maxRetries: 3,
        retryDelay: 2000,
        errorThreshold: 10,
        autoValidation: true,
        validationDelay: 5000
      },
      
      // UI配置
      ui: {
        theme: 'light',
        language: 'zh-CN',
        compactMode: false,
        showDevTools: false,
        animations: true
      },
      
      // 通知配置
      notification: {
        enabled: true,
        soundEnabled: true,
        desktopEnabled: true,
        taskComplete: true,
        taskError: true
      },
      
      // 日志配置
      log: {
        level: 'info', // debug, info, warn, error
        maxFiles: 10,
        maxSize: '10MB',
        saveToFile: true,
        outputDir: path.join(process.cwd(), 'logs')
      },
      
      // 问卷类型配置
      questionnaireTypes: {
        liuwei_patient: {
          name: '六味患者问卷',
          type: 'liuwei_patient',
          contactType: '患者',
          sheetName: '六味患者问卷',
          keywords: ['六味', '患者', '问卷'],
          createUrl: '/lgb/mobile/hzwj.jsp?t=true',
          apiEndpoint: '/lgb/hzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=/hzwj/add',
          listType: '患者问卷',
          labelName: '患者姓名',
          hasChannel: false,
          columnFormat: 'simple',
          description: '六味地黄丸患者问卷，无需创建医院'
        },
        xihuang_consumer: {
          name: '西黄消费者问卷',
          type: 'xihuang_consumer',
          contactType: '消费者',
          sheetName: '西黄消费者问卷',
          keywords: ['西黄', '消费者', '问卷'],
          createUrl: '/lgb/mobile/xfzwj.jsp?t=true',
          apiEndpoint: '/lgb/xfzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
          listType: '消费者问卷',
          labelName: '消费者姓名',
          hasChannel: true,
          columnFormat: 'simple',
          description: '西黄丸消费者问卷，需要创建消费者和医院'
        },
        niujie_consumer: {
          name: '牛解消费者问卷',
          type: 'niujie_consumer',
          contactType: '消费者',
          sheetName: '牛解消费者问卷',
          keywords: ['牛解', '消费者', '问卷'],
          createUrl: '/lgb/mobile/njwj.jsp?t=true',
          apiEndpoint: '/lgb/xfzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
          listType: '消费者问卷',
          labelName: '消费者姓名',
          hasChannel: true,
          columnFormat: 'simple',
          description: '牛解消费者问卷'
        },
        zhibai_consumer: {
          name: '知柏消费者问卷',
          type: 'zhibai_consumer',
          contactType: '消费者',
          sheetName: '知柏消费者问卷',
          keywords: ['知柏', '消费者', '问卷'],
          createUrl: '/lgb/mobile/zbwj.jsp?t=true',
          apiEndpoint: '/lgb/xfzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
          listType: '消费者问卷',
          labelName: '消费者姓名',
          hasChannel: true,
          columnFormat: 'simple',
          description: '知柏消费者问卷'
        },
        tiegao_patient: {
          name: '贴膏患者问卷',
          type: 'tiegao_patient',
          contactType: '患者',
          sheetName: '贴膏患者问卷',
          keywords: ['贴膏', '患者', '问卷'],
          createUrl: '/lgb/mobile/tgwj.jsp?t=true',
          apiEndpoint: '/lgb/hzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=/hzwj/add',
          listType: '患者问卷',
          labelName: '患者姓名',
          hasChannel: false,
          columnFormat: 'simple',
          description: '贴膏患者问卷'
        }
      },
      
      // 产品关键词
      productKeywords: ['六味', '西黄', '牛解', '知柏', '贴膏'],
      
      // 偏好设置
      preferences: {
        sheetPreferences: {},
        recentProjects: [],
        defaultQuestionnaireType: null,
        autoSaveInterval: 60000,
        maxRecentItems: 10
      }
    };
    
    // 合并存储中的配置
    const storedConfig = this.store.get('config', {});
    this.mergeConfig(storedConfig);
  }
  
  /**
   * 初始化配置管理器
   */
  async initialize() {
    console.log('⚙️ 初始化配置管理器...');
    
    // 创建日志目录
    if (this.config.log.saveToFile) {
      await this.ensureLogDirectory();
    }
    
    // 验证配置
    this.validateConfig();
    
    console.log('✅ 配置管理器初始化完成');
  }
  
  /**
   * 合并配置
   */
  mergeConfig(newConfig) {
    // 深度合并配置
    this.config = this.deepMerge(this.config, newConfig);
  }
  
  /**
   * 深度合并对象
   */
  deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
  
  /**
   * 判断是否为对象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
  
  /**
   * 获取配置
   */
  getConfig(key) {
    if (!key) {
      return this.config;
    }
    
    // 支持点号分隔的路径
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  /**
   * 设置配置
   */
  setConfig(key, value) {
    const keys = key.split('.');
    let target = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    
    const lastKey = keys[keys.length - 1];
    const oldValue = target[lastKey];
    target[lastKey] = value;
    
    // 保存到存储
    this.save();
    
    // 发出事件
    this.emit('config:changed', { key, value, oldValue });
    
    return value;
  }
  
  /**
   * 批量更新配置
   */
  updateConfig(updates) {
    Object.keys(updates).forEach(key => {
      this.setConfig(key, updates[key]);
    });
  }
  
  /**
   * 重置配置
   */
  resetConfig(key) {
    if (!key) {
      // 重置所有配置
      this.store.delete('config');
      this.config = this.getDefaultConfig();
    } else {
      // 重置特定配置
      const defaultValue = this.getDefaultConfig(key);
      this.setConfig(key, defaultValue);
    }
    
    this.emit('config:reset', key);
  }
  
  /**
   * 获取默认配置
   */
  getDefaultConfig(key) {
    // 这里应该返回默认配置
    // 简化处理，直接返回当前配置
    return key ? this.getConfig(key) : this.config;
  }
  
  /**
   * 验证配置
   */
  validateConfig() {
    // 验证必要的配置项
    const requiredKeys = [
      'api.baseUrl',
      'api.endpoints',
      'execution.concurrency',
      'log.level'
    ];
    
    for (const key of requiredKeys) {
      const value = this.getConfig(key);
      if (value === undefined || value === null) {
        console.warn(`⚠️ 配置项 ${key} 未设置，使用默认值`);
      }
    }
    
    // 验证数值范围
    const concurrency = this.getConfig('execution.concurrency');
    if (concurrency < 1 || concurrency > 10) {
      console.warn('⚠️ 并发数配置不合理，已调整为3');
      this.setConfig('execution.concurrency', 3);
    }
  }
  
  /**
   * 保存配置到存储
   */
  async save() {
    try {
      // 过滤敏感信息
      const configToSave = this.filterSensitiveData(this.config);
      this.store.set('config', configToSave);
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }
  
  /**
   * 过滤敏感数据
   */
  filterSensitiveData(config) {
    // 创建配置的深拷贝
    const filtered = JSON.parse(JSON.stringify(config));
    
    // 移除或脱敏敏感信息
    // 这里可以根据需要添加更多的过滤规则
    
    return filtered;
  }
  
  /**
   * 导出配置
   */
  async exportConfig(filePath) {
    try {
      const configToExport = this.filterSensitiveData(this.config);
      const jsonStr = JSON.stringify(configToExport, null, 2);
      await fs.writeFile(filePath, jsonStr, 'utf-8');
      return true;
    } catch (error) {
      console.error('导出配置失败:', error);
      return false;
    }
  }
  
  /**
   * 导入配置
   */
  async importConfig(filePath) {
    try {
      const jsonStr = await fs.readFile(filePath, 'utf-8');
      const importedConfig = JSON.parse(jsonStr);
      
      // 验证导入的配置
      if (!this.isValidConfig(importedConfig)) {
        throw new Error('无效的配置文件');
      }
      
      // 合并配置
      this.mergeConfig(importedConfig);
      
      // 保存
      await this.save();
      
      // 发出事件
      this.emit('config:imported', importedConfig);
      
      return true;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }
  
  /**
   * 验证配置格式
   */
  isValidConfig(config) {
    // 简单验证配置结构
    return config && 
           typeof config === 'object' &&
           'api' in config &&
           'execution' in config;
  }
  
  /**
   * 确保日志目录存在
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.config.log.outputDir, { recursive: true });
    } catch (error) {
      console.error('创建日志目录失败:', error);
    }
  }
  
  /**
   * 获取问卷类型配置
   */
  getQuestionnaireType(type) {
    return this.config.questionnaireTypes[type];
  }
  
  /**
   * 获取所有问卷类型
   */
  getAllQuestionnaireTypes() {
    return Object.values(this.config.questionnaireTypes);
  }
  
  /**
   * 添加最近项目
   */
  addRecentProject(project) {
    const recent = this.getConfig('preferences.recentProjects') || [];
    
    // 移除已存在的项目
    const filtered = recent.filter(p => p.id !== project.id);
    
    // 添加到开头
    filtered.unshift(project);
    
    // 限制数量
    const maxItems = this.getConfig('preferences.maxRecentItems') || 10;
    const trimmed = filtered.slice(0, maxItems);
    
    this.setConfig('preferences.recentProjects', trimmed);
  }
  
  /**
   * 获取Sheet偏好
   */
  getSheetPreference(questionnaireType) {
    const preferences = this.getConfig('preferences.sheetPreferences') || {};
    return preferences[questionnaireType];
  }
  
  /**
   * 设置Sheet偏好
   */
  setSheetPreference(questionnaireType, sheetName) {
    const preferences = this.getConfig('preferences.sheetPreferences') || {};
    preferences[questionnaireType] = sheetName;
    this.setConfig('preferences.sheetPreferences', preferences);
  }
}

module.exports = { ConfigManager };