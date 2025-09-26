/**
 * 配置管理器
 * 支持用户自定义设置、API 配置、任务参数等
 */

const EventEmitter = require('events');
const Store = require('electron-store');
const path = require('path');

class ConfigManager extends EventEmitter {
    constructor() {
        super();
        
        // 初始化配置存储
        this.store = new Store({
            name: 'zxyy-automation-config',
            defaults: this.getDefaultConfig()
        });
        
        // 当前配置缓存
        this.config = this.store.store;
        
        // 监听配置变化
        this.store.onDidAnyChange((newValue, oldValue) => {
            this.config = newValue;
            this.emit('configChanged', { newValue, oldValue });
        });
    }

    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            // API 配置
            api: {
                baseUrl: 'https://zxyy.ltd',
                timeout: 30000,
                retryAttempts: 3,
                retryDelay: 2000
            },
            
            // 任务执行配置
            execution: {
                concurrency: 1,
                stepDelay: 1500,
                contactStepDelay: 1500,
                questionnaireStepDelay: 1500,
                postCreateVerifyDelay: 1000,
                maxRetries: 3,
                retryDelays: [1000, 2000, 4000]
            },
            
            // 数据处理配置
            dataProcessing: {
                pageSize: 20,
                maxRecordsPerBatch: 1000,
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'MM.DD'
            },
            
            // 验证配置
            validation: {
                autoValidateAfterCreation: true,
                validationDelay: 2000,
                batchValidationDelay: 500
            },
            
            // UI 配置
            ui: {
                theme: 'light',
                language: 'zh-CN',
                autoSave: true,
                autoSaveInterval: 30000,
                showNotifications: true,
                minimizeToTray: true
            },
            
            // 日志配置
            logging: {
                level: 'info',
                maxLogFiles: 10,
                maxLogSize: '10MB',
                enableConsoleLog: true,
                enableFileLog: true
            },
            
            // 问卷类型配置
            questionnaireTypes: {
                liuwei_patient: {
                    name: '六味患者问卷',
                    contactType: '患者',
                    createUrl: '/lgb/mobile/hzwj.jsp?t=true',
                    listType: '患者问卷',
                    labelName: '患者姓名',
                    hasChannel: false,
                    enabled: true
                },
                xihuang_consumer: {
                    name: '西黄消费者问卷',
                    contactType: '消费者',
                    createUrl: '/lgb/mobile/xfzwj.jsp?t=true',
                    listType: '消费者问卷',
                    labelName: '消费者姓名',
                    hasChannel: false,
                    enabled: true
                }
            },
            
            // 用户偏好设置
            preferences: {
                defaultQuestionnaireType: '',
                defaultProjectId: '',
                rememberLastSession: true,
                autoLoadLastData: false,
                confirmBeforeExecution: true,
                showProgressDetails: true
            },
            
            // 高级设置
            advanced: {
                enableDebugMode: false,
                enableExperimentalFeatures: false,
                customUserAgent: '',
                proxySettings: {
                    enabled: false,
                    host: '',
                    port: '',
                    username: '',
                    password: ''
                }
            }
        };
    }

    /**
     * 获取配置值
     * @param {string} key - 配置键，支持点号分隔的路径
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     */
    get(key, defaultValue = undefined) {
        return this.store.get(key, defaultValue);
    }

    /**
     * 设置配置值
     * @param {string|Object} key - 配置键或配置对象
     * @param {*} value - 配置值
     */
    set(key, value) {
        if (typeof key === 'object') {
            // 批量设置
            Object.keys(key).forEach(k => {
                this.store.set(k, key[k]);
            });
        } else {
            this.store.set(key, value);
        }
        this.emit('configUpdated', { key, value });
    }

    /**
     * 删除配置项
     * @param {string} key - 配置键
     */
    delete(key) {
        this.store.delete(key);
        this.emit('configDeleted', { key });
    }

    /**
     * 检查配置项是否存在
     * @param {string} key - 配置键
     * @returns {boolean}
     */
    has(key) {
        return this.store.has(key);
    }

    /**
     * 重置配置到默认值
     * @param {string} section - 配置节，如果不指定则重置全部
     */
    reset(section = null) {
        if (section) {
            const defaultConfig = this.getDefaultConfig();
            if (defaultConfig[section]) {
                this.store.set(section, defaultConfig[section]);
                this.emit('configReset', { section });
            }
        } else {
            this.store.clear();
            this.store.store = this.getDefaultConfig();
            this.emit('configReset', { section: 'all' });
        }
    }

    /**
     * 获取所有配置
     * @returns {Object} 完整配置对象
     */
    getAll() {
        return this.store.store;
    }

    /**
     * 导出配置到文件
     * @param {string} filePath - 导出文件路径
     */
    async exportConfig(filePath) {
        try {
            const fs = require('fs').promises;
            const config = this.getAll();
            await fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf8');
            this.emit('configExported', { filePath });
            return true;
        } catch (error) {
            this.emit('configExportError', { filePath, error });
            throw error;
        }
    }

    /**
     * 从文件导入配置
     * @param {string} filePath - 导入文件路径
     * @param {boolean} merge - 是否合并配置，false 则完全替换
     */
    async importConfig(filePath, merge = true) {
        try {
            const fs = require('fs').promises;
            const configData = await fs.readFile(filePath, 'utf8');
            const importedConfig = JSON.parse(configData);
            
            if (merge) {
                // 合并配置
                const currentConfig = this.getAll();
                const mergedConfig = this.deepMerge(currentConfig, importedConfig);
                this.store.store = mergedConfig;
            } else {
                // 完全替换
                this.store.clear();
                this.store.store = importedConfig;
            }
            
            this.emit('configImported', { filePath, merge });
            return true;
        } catch (error) {
            this.emit('configImportError', { filePath, error });
            throw error;
        }
    }

    /**
     * 深度合并对象
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * 验证配置有效性
     * @param {Object} config - 要验证的配置
     * @returns {Object} 验证结果
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        
        // 验证 API 配置
        if (config.api) {
            if (!config.api.baseUrl || !this.isValidUrl(config.api.baseUrl)) {
                errors.push('API baseUrl 无效');
            }
            if (config.api.timeout && (config.api.timeout < 1000 || config.api.timeout > 300000)) {
                warnings.push('API timeout 建议设置在 1000-300000ms 之间');
            }
        }
        
        // 验证执行配置
        if (config.execution) {
            if (config.execution.concurrency && (config.execution.concurrency < 1 || config.execution.concurrency > 10)) {
                warnings.push('并发数建议设置在 1-10 之间');
            }
            if (config.execution.stepDelay && config.execution.stepDelay < 500) {
                warnings.push('步骤延迟建议不少于 500ms');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 验证 URL 有效性
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 获取配置模板
     * @param {string} templateName - 模板名称
     * @returns {Object} 配置模板
     */
    getConfigTemplate(templateName) {
        const templates = {
            development: {
                api: {
                    baseUrl: 'http://localhost:3000',
                    timeout: 10000
                },
                execution: {
                    stepDelay: 500
                },
                logging: {
                    level: 'debug',
                    enableConsoleLog: true
                },
                advanced: {
                    enableDebugMode: true
                }
            },
            production: {
                api: {
                    baseUrl: 'https://zxyy.ltd',
                    timeout: 30000
                },
                execution: {
                    stepDelay: 1500
                },
                logging: {
                    level: 'info',
                    enableConsoleLog: false
                },
                advanced: {
                    enableDebugMode: false
                }
            },
            testing: {
                api: {
                    baseUrl: 'https://test.zxyy.ltd',
                    timeout: 15000
                },
                execution: {
                    stepDelay: 1000,
                    maxRetries: 1
                },
                logging: {
                    level: 'warn'
                }
            }
        };
        
        return templates[templateName] || null;
    }

    /**
     * 应用配置模板
     * @param {string} templateName - 模板名称
     * @param {boolean} merge - 是否合并，false 则覆盖对应部分
     */
    applyTemplate(templateName, merge = true) {
        const template = this.getConfigTemplate(templateName);
        if (!template) {
            throw new Error(`未找到配置模板: ${templateName}`);
        }
        
        if (merge) {
            const currentConfig = this.getAll();
            const mergedConfig = this.deepMerge(currentConfig, template);
            this.store.store = mergedConfig;
        } else {
            Object.keys(template).forEach(key => {
                this.store.set(key, template[key]);
            });
        }
        
        this.emit('templateApplied', { templateName, merge });
    }

    /**
     * 获取配置文件路径
     */
    getConfigPath() {
        return this.store.path;
    }

    /**
     * 获取配置大小
     */
    getConfigSize() {
        try {
            const fs = require('fs');
            const stats = fs.statSync(this.store.path);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * 监听配置变化
     * @param {string} key - 配置键
     * @param {Function} callback - 回调函数
     */
    watch(key, callback) {
        this.store.onDidChange(key, callback);
    }

    /**
     * 取消监听配置变化
     * @param {string} key - 配置键
     */
    unwatch(key) {
        this.store.offDidChange(key);
    }

    /**
     * 获取配置变更历史（如果启用了历史记录）
     */
    getConfigHistory() {
        // 这里可以实现配置变更历史记录功能
        return this.get('_history', []);
    }

    /**
     * 备份当前配置
     */
    backup() {
        const timestamp = new Date().toISOString();
        const backupKey = `_backup_${timestamp}`;
        const currentConfig = this.getAll();
        
        // 保存备份（排除备份数据本身）
        const configToBackup = { ...currentConfig };
        delete configToBackup._backup;
        delete configToBackup._history;
        
        this.set(`_backup.${timestamp}`, configToBackup);
        this.emit('configBackup', { timestamp });
        
        return timestamp;
    }

    /**
     * 恢复配置备份
     * @param {string} timestamp - 备份时间戳
     */
    restore(timestamp) {
        const backupConfig = this.get(`_backup.${timestamp}`);
        if (!backupConfig) {
            throw new Error(`未找到备份: ${timestamp}`);
        }
        
        // 保留当前的备份数据
        const currentBackups = this.get('_backup', {});
        
        // 恢复配置
        this.store.clear();
        this.store.store = { ...backupConfig, _backup: currentBackups };
        
        this.emit('configRestored', { timestamp });
    }

    /**
     * 获取所有备份
     */
    getBackups() {
        const backups = this.get('_backup', {});
        return Object.keys(backups).map(timestamp => ({
            timestamp,
            date: new Date(timestamp),
            size: JSON.stringify(backups[timestamp]).length
        }));
    }

    /**
     * 删除备份
     * @param {string} timestamp - 备份时间戳
     */
    deleteBackup(timestamp) {
        this.delete(`_backup.${timestamp}`);
        this.emit('backupDeleted', { timestamp });
    }
}

module.exports = ConfigManager;
