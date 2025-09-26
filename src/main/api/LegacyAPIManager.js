/**
 * LegacyAPIManager - 基于统一自动化脚本的API管理器
 * 完全兼容统一自动化脚本_模块化版.html中的API调用方式、参数和签名
 */

const EventEmitter = require('events');
const fetch = require('electron-fetch').default;
const crypto = require('crypto');

class LegacyAPIManager extends EventEmitter {
    constructor(baseUrl = 'https://zxyy.ltd') {
        super();
        this.baseUrl = baseUrl;
        this.isAuthenticated = false;
        
        // API 端点配置 - 与统一脚本保持一致
        this.endpoints = {
            // 问卷创建
            xihuang_consumer: '/lgb/xfzwj/add',
            liuwei_patient: '/lgb/hzwj/add',
            niujie_consumer: '/lgb/xfzwj/add',
            zhibai_consumer: '/lgb/xfzwj/add',
            tiegao_patient: '/lgb/hzwj/add',
            
            // 获取动态盐值
            createDynamicsSalt: {
                xihuang_consumer: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
                liuwei_patient: '/lgb/payMerge/createDynamicsSalt?methodName=/hzwj/add',
                niujie_consumer: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
                zhibai_consumer: '/lgb/payMerge/createDynamicsSalt?methodName=/xfzwj/add',
                tiegao_patient: '/lgb/payMerge/createDynamicsSalt?methodName=/hzwj/add'
            },
            
            // 联系人管理
            contactQuery: '/lgb/lxrgl/getMessage',
            contactSave: '/lgb/lxrgl/save',
            
            // 渠道管理
            channelSave: '/lgb/qdkh/save',
            
            // 验证相关
            submitList: '/lgb/project/submitList'
        };
        
        // 问卷类型配置
        this.questionnaireConfig = {
            xihuang_consumer: {
                name: '西黄消费者问卷',
                contactType: '消费者',
                title: '致力庆西黄丸消费者问卷',
                memo: '为了充分了解客户对于西黄丸产品评价，为更好的做好临床药学服务，促进产品在临床的安全合理的使用，便于下一步市场策略的规划，特进行本次问卷调查。',
                hasChannel: true
            },
            liuwei_patient: {
                name: '六味患者问卷',
                contactType: '患者',
                title: '六味地黄丸患者问卷',
                memo: '六味地黄丸患者使用情况调查',
                hasChannel: false
            },
            niujie_consumer: {
                name: '牛解消费者问卷',
                contactType: '消费者',
                title: '牛解消费者问卷',
                memo: '牛解消费者使用情况调查',
                hasChannel: true
            },
            zhibai_consumer: {
                name: '知柏消费者问卷',
                contactType: '消费者',
                title: '知柏消费者问卷',
                memo: '知柏消费者使用情况调查',
                hasChannel: true
            },
            tiegao_patient: {
                name: '贴膏患者问卷',
                contactType: '患者',
                title: '贴膏患者问卷',
                memo: '贴膏患者使用情况调查',
                hasChannel: false
            }
        };

        // 默认项目参数 - 从统一脚本中提取
        this.defaultProjectParams = {
            projectId: '1756460958725101',
            corpId: '1749721838789101',
            projectTpl: '1756451075934101',
            sponsorProjectId: '1756451241652103'
        };
    }

    /**
     * 创建问卷 - Legacy模式API调用
     */
    async createQuestionnaire(questionnaireType, itemData, answers = []) {
        try {
            const config = this.questionnaireConfig[questionnaireType];
            if (!config) {
                throw new Error(`不支持的问卷类型: ${questionnaireType}`);
            }

            console.log(`📝 开始创建${config.name}: ${itemData.name} (${itemData.sex})`);

            // 1. 获取动态盐值
            const saltData = await this.getDynamicsSalt(questionnaireType);
            
            // 2. 构建请求数据
            const requestData = this.buildQuestionnaireData(questionnaireType, itemData, answers);
            
            // 3. 生成签名
            const encryptedText = this.formatParamsForEncryption(requestData);
            const signature = this.generateHMACSignature(encryptedText, saltData.signkey);
            
            // 4. 发送请求
            const endpoint = this.endpoints[questionnaireType];
            const result = await this.sendFormRequest(endpoint, requestData, {
                'sign': signature,
                'signkey': saltData.signkey
            });

            // 5. 处理响应
            return this.processApiResponse(result, itemData.name, itemData.sex);

        } catch (error) {
            console.error(`❌ 创建问卷失败: ${itemData.name}`, error);
            throw error;
        }
    }

    /**
     * 获取动态盐值 - 与统一脚本保持一致的实现
     */
    async getDynamicsSalt(questionnaireType) {
        try {
            const endpoint = this.endpoints.createDynamicsSalt[questionnaireType];
            if (!endpoint) {
                throw new Error(`未找到${questionnaireType}的盐值端点`);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'accept': '*/*',
                    'x-requested-with': 'XMLHttpRequest'
                }
            });

            const result = await response.json();
            
            if (result.data) {
                console.log(`🔐 获取到动态盐值: ${result.data.signkey.substring(0, 8)}...`);
                return result.data;
            } else {
                console.warn('⚠️ 未获取到盐值数据，使用空字符串');
                return { signkey: '' };
            }

        } catch (error) {
            console.warn(`⚠️ 获取盐值失败: ${error.message}，使用空字符串`);
            return { signkey: '' };
        }
    }

    /**
     * 构建问卷请求数据 - 完全兼容统一脚本的格式
     */
    buildQuestionnaireData(questionnaireType, itemData, answers = []) {
        const config = this.questionnaireConfig[questionnaireType];
        const currentDate = this.formatDateForAPI(itemData.time);

        // 基础请求数据结构 - 与统一脚本保持一致
        const requestData = {
            // 基本信息
            name: itemData.name,
            sex: itemData.sex,
            date: currentDate,
            
            // 项目字段
            recId: '',
            nvcVal: '',
            latLng: '',
            projectId: this.defaultProjectParams.projectId,
            corpId: this.defaultProjectParams.corpId,
            projectTpl: this.defaultProjectParams.projectTpl,
            sponsorProjectId: this.defaultProjectParams.sponsorProjectId,
            isForward: '1',
            title: config.title,
            way: '实名调查',
            startTime: currentDate,
            memo: config.memo,
            dcdxName: '吴承', // 默认调查对象名称
            fieldName: '性别',
            fill: itemData.sex,
            channelAddress: ''
        };

        // 添加答案数据
        if (answers && answers.length > 0) {
            // JSON格式的答案
            requestData.answers = JSON.stringify(answers);
            
            // 单独的answer字段
            answers.forEach((answer, index) => {
                if (answer !== undefined) {
                    requestData[`answer${index}`] = answer;
                }
            });
        }

        return requestData;
    }

    /**
     * 格式化参数用于加密 - 与统一脚本保持一致
     */
    formatParamsForEncryption(data) {
        // 过滤掉undefined和null值
        const filteredData = {};
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                filteredData[key] = data[key];
            }
        }

        // 按键名排序并生成查询字符串
        const sortedKeys = Object.keys(filteredData).sort();
        const queryString = sortedKeys.map(key => 
            `${encodeURIComponent(key)}=${encodeURIComponent(filteredData[key])}`
        ).join('&');

        // 如果长度超过255，截断
        return queryString.length > 255 ? queryString.substring(0, 255) : queryString;
    }

    /**
     * 生成HMAC SHA256签名 - Node.js版本实现
     */
    generateHMACSignature(message, key) {
        if (!key) {
            console.warn('⚠️ 签名密钥为空，跳过签名');
            return '';
        }

        try {
            const hmac = crypto.createHmac('sha256', key);
            hmac.update(message, 'utf8');
            return hmac.digest('hex');
        } catch (error) {
            console.error('❌ 签名生成失败:', error);
            return '';
        }
    }

    /**
     * 发送表单请求 - 模拟jQuery.ajax的行为
     */
    async sendFormRequest(endpoint, data, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // 构建form-urlencoded数据
        const formData = new URLSearchParams();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }

        const requestConfig = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
                ...headers
            },
            body: formData.toString()
        };

        console.log(`📤 发送请求到: ${endpoint}`);
        console.log(`🔐 签名: ${headers.sign ? headers.sign.substring(0, 16) + '...' : '无'}`);

        const response = await fetch(url, requestConfig);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 处理API响应 - 兼容多种响应格式
     */
    processApiResponse(result, name, sex) {
        const code = result.code || result.errCode;
        const message = result.message || result.errMsg || result.msg;

        console.log(`📥 API响应: code=${code}, message=${message}`);

        // 检查成功状态 - 兼容旧版本的code=0和新版本的code=200
        if (code === 0 || code === '0' || code === 200 || code === '200') {
            console.log(`✅ 创建成功: ${name} (${sex})`);
            return { 
                success: true, 
                data: result,
                name: name,
                sex: sex
            };
        }

        // 检查任务数量达标
        if (code === 5000 || code === '5000') {
            if (message && message.includes('任务数量已达标')) {
                console.log(`🎯 任务数量已达标: ${name} (${sex}) - ${message}`);
                return { 
                    success: false, 
                    isQuotaReached: true, 
                    message: message,
                    name: name,
                    sex: sex
                };
            }
        }

        // 其他错误情况
        const errorMsg = message || '未知错误';
        console.error(`❌ API返回错误: ${errorMsg}`);
        throw new Error(`API返回错误: ${errorMsg}`);
    }

    /**
     * 创建联系人 - Legacy模式
     */
    async createContact(itemData) {
        try {
            const config = this.questionnaireConfig[itemData.questionnaireType] || 
                         { contactType: itemData.contactType || '患者' };

            console.log(`👤 创建联系人: ${itemData.name} (${itemData.sex})`);

            // 1. 先查询是否已存在
            const existingContact = await this.queryContact(itemData.name, itemData.sex, config.contactType);
            if (existingContact) {
                console.log(`👤 联系人已存在: ${itemData.name}`);
                return { success: true, existed: true, data: existingContact };
            }

            // 2. 创建新联系人
            const contactData = {
                recId: '',
                nvcVal: '',
                empRecId: '',
                lxrType: config.contactType,
                name: itemData.name,
                sex: itemData.sex,
                remark: ''
            };

            const result = await this.sendFormRequest(this.endpoints.contactSave, contactData);
            
            if (result.code === 0 || result.code === 200) {
                console.log(`✅ 联系人创建成功: ${itemData.name}`);
                return { success: true, existed: false, data: result };
            } else {
                throw new Error(result.message || '创建联系人失败');
            }

        } catch (error) {
            console.error(`❌ 创建联系人失败: ${itemData.name}`, error);
            throw error;
        }
    }

    /**
     * 查询联系人
     */
    async queryContact(name, sex, contactType = '患者') {
        try {
            const queryData = {
                recId: '',
                nvcVal: '',
                empRecId: '',
                lxrType: contactType,
                name: name,
                sex: sex,
                remark: ''
            };

            const result = await this.sendFormRequest(this.endpoints.contactQuery, queryData);
            
            // code不为0表示不存在
            if (result.code !== 0) {
                return null;
            }

            return result.data || result;

        } catch (error) {
            // 查询失败返回null，不抛出错误
            console.warn(`⚠️ 查询联系人失败: ${name}`, error.message);
            return null;
        }
    }

    /**
     * 创建渠道（医院）- Legacy模式
     */
    async createChannel(channelData) {
        try {
            console.log(`🏥 创建医院: ${channelData.channelName}`);

            const requestData = {
                recId: '',
                nvcVal: '',
                empRecId: '',
                channelName: channelData.channelName,
                channelType: '医院',
                address: channelData.address || '北京市朝阳区',
                adcode: this.getAreaCode(channelData.address || '北京市朝阳区'),
                remark: ''
            };

            const result = await this.sendFormRequest(this.endpoints.channelSave, requestData);
            
            if (result.code === 0 || result.code === 200) {
                console.log(`✅ 医院创建成功: ${channelData.channelName}`);
                return { success: true, data: result };
            } else {
                throw new Error(result.message || '创建医院失败');
            }

        } catch (error) {
            console.error(`❌ 创建医院失败: ${channelData.channelName}`, error);
            throw error;
        }
    }

    /**
     * 获取地区代码 - 与统一脚本保持一致
     */
    getAreaCode(address) {
        const codes = {
            '北京': '110000',
            '上海': '310000',
            '广州': '440100',
            '深圳': '440300',
            '杭州': '330100',
            '成都': '510100',
            '武汉': '420100',
            '西安': '610100',
            '南京': '320100',
            '重庆': '500000'
        };

        for (const city in codes) {
            if (address.includes(city)) {
                return codes[city];
            }
        }
        return '110000'; // 默认北京
    }

    /**
     * 格式化日期用于API - 转换为YYYY-MM-DD格式
     */
    formatDateForAPI(dateStr) {
        if (!dateStr) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // 如果是MM.DD格式，转换为当年的YYYY-MM-DD
        if (/^\d{1,2}\.\d{1,2}$/.test(dateStr)) {
            const [month, day] = dateStr.split('.');
            const year = new Date().getFullYear();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // 如果已经是YYYY-MM-DD格式，直接返回
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
            return dateStr;
        }

        // 默认返回今天
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 生成问卷答案 - 根据问卷类型生成随机答案
     */
    generateAnswers(questionnaireType, itemData = {}) {
        const generators = {
            xihuang_consumer: () => this.generateXihuangAnswers(itemData),
            liuwei_patient: () => this.generateLiuweiAnswers(itemData),
            niujie_consumer: () => this.generateNiujieAnswers(itemData),
            zhibai_consumer: () => this.generateZhibaiAnswers(itemData),
            tiegao_patient: () => this.generateTiegaoAnswers(itemData)
        };

        const generator = generators[questionnaireType];
        return generator ? generator() : [];
    }

    /**
     * 生成西黄消费者问卷答案
     */
    generateXihuangAnswers(itemData) {
        return [
            this.randomChoice(['20 岁以下', '21~34 岁', '35~59', '60 岁以上']),
            this.randomChoice(['价格实惠', '质量好', '交通便利', '药品种类齐全', '服务周到']),
            this.randomChoice(['免费测血压', '坐堂医生', '药品促销', '提供更完善的药学服务']),
            this.randomChoice(['专业知识', '服务态度', '讲解能力', '店员形象']),
            this.randomChoice(['很耐心', '一般', '不耐心']),
            this.randomChoice(['很专业', '一般专业', '不专业']),
            this.randomChoice(['每次都是', '多数', '偶尔', '从不']),
            this.randomChoice(['每次都是', '多数', '偶尔', '从不']),
            this.randomChoice(['是', '否']),
            this.randomChoice(['疗效', '品牌知名度', '价格', '味道'])
        ];
    }

    /**
     * 生成六味患者问卷答案
     */
    generateLiuweiAnswers(itemData) {
        return [
            this.randomChoice(['1个月以内', '1-3个月', '3-6个月', '6-12个月', '12个月以上']),
            this.randomChoice(['腰膝酸软', '头晕耳鸣', '畏寒怕冷', '夜尿频多', '其他']),
            this.randomChoice(['每日1次', '每日2次', '每日3次', '其他']),
            this.randomChoice(['是', '否']),
            this.randomChoice(['瓶装', '盒装', '袋装', '无偏好']),
            this.randomChoice(['很好', '好', '一般', '不好']),
            this.randomChoice(['非常愿意', '愿意', '一般', '不愿意']),
            this.randomChoice(['非常敏感', '敏感', '一般', '不敏感']),
            this.randomChoice(['显著改善', '有所改善', '无明显改善', '无改善']),
            this.randomChoice(['非常愿意', '愿意', '一般', '不愿意'])
        ];
    }

    /**
     * 生成牛解消费者问卷答案（示例）
     */
    generateNiujieAnswers(itemData) {
        // 牛解问卷答案生成逻辑
        return [
            this.randomChoice(['选项A', '选项B', '选项C']),
            this.randomChoice(['选项1', '选项2', '选项3']),
            // ... 根据实际问卷添加更多答案
        ];
    }

    /**
     * 生成知柏消费者问卷答案（示例）
     */
    generateZhibaiAnswers(itemData) {
        // 知柏问卷答案生成逻辑
        return [
            this.randomChoice(['选项A', '选项B', '选项C']),
            this.randomChoice(['选项1', '选项2', '选项3']),
            // ... 根据实际问卷添加更多答案
        ];
    }

    /**
     * 生成贴膏患者问卷答案（示例）
     */
    generateTiegaoAnswers(itemData) {
        // 贴膏问卷答案生成逻辑
        return [
            this.randomChoice(['选项A', '选项B', '选项C']),
            this.randomChoice(['选项1', '选项2', '选项3']),
            // ... 根据实际问卷添加更多答案
        ];
    }

    /**
     * 随机选择工具函数
     */
    randomChoice(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * 获取认证状态
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated
        };
    }
}

module.exports = LegacyAPIManager;