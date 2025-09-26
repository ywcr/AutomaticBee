/**
 * API 管理器
 * 统一管理所有与 zxyy.ltd 的 API 交互
 */

const EventEmitter = require('events');
const { session } = require('electron');
const SignatureUtils = require('./SignatureUtils');
const LegacyAPIManager = require('./LegacyAPIManager');

class APIManager extends EventEmitter {
    constructor(baseUrl = 'https://zxyy.ltd') {
        super();
        this.baseUrl = baseUrl;
        this.session = null;
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // 初始化LegacyAPIManager
        this.legacyApiManager = new LegacyAPIManager(baseUrl);
        this.useLegacyMode = false; // 默认不使用legacy模式
        
        // API 端点配置
        this.endpoints = {
            // 用户相关
            getUserName: '/lgb/user/getUserName',
            
            // 任务相关
            taskTypes: '/lgb/workOrder/type/list',
            taskList: '/lgb/workOrder/mobile/history/list',
            submitRange: '/lgb/project/getSubmitRangeTime',
            
            // 联系人相关
            contactQuery: '/lgb/lxrgl/getMessage',
            contactSave: '/lgb/lxrgl/save',
            contactList: '/lgb/lxrgl/getList',
            
            // 问卷相关
            questionnaireAdd: {
                liuwei_patient: '/lgb/hzwj/add',
                xihuang_consumer: '/lgb/xfzwj/add'
            },
            questionnaireList: '/lgb/workOrder/mobile/list',
            
            // 其他
            channelSave: '/lgb/qdkh/save',
            areaTree: '/lgb/system/area/tree',
            createDynamicsSalt: {
                liuwei_patient: '/lgb/hzwj/createDynamicsSalt',
                xihuang_consumer: '/lgb/payMerge/createDynamicsSalt?methodName=%2Fxfzwj%2Fadd'
            }
        };
        
        // 问卷类型配置
        this.questionnaireTypes = {
            liuwei_patient: {
                name: '六味患者问卷',
                contactType: '患者',
                createUrl: '/lgb/mobile/hzwj.jsp?t=true',
                listType: '患者问卷',
                labelName: '患者姓名',
                hasChannel: false
            },
            xihuang_consumer: {
                name: '西黄消费者问卷',
                contactType: '消费者',
                createUrl: '/lgb/mobile/xfzwj.jsp?t=true',
                listType: '消费者问卷',
                labelName: '消费者姓名',
                hasChannel: false
            }
        };
    }

    /**
     * 初始化 API 管理器
     */
    async initialize() {
        try {
            this.session = session.defaultSession;
            await this.checkAuthentication();
            this.emit('initialized');
        } catch (error) {
            this.emit('error', { type: 'initialization', error });
            throw error;
        }
    }

    /**
     * 设置Legacy模式
     */
    setLegacyMode(enabled) {
        this.useLegacyMode = enabled;
        console.log(`🔄 API模式切换: ${enabled ? 'Legacy模式' : '标准模式'}`);
        this.emit('legacyModeChanged', enabled);
    }

    /**
     * 获取当前Legacy模式状态
     */
    isLegacyMode() {
        return this.useLegacyMode;
    }

    /**
     * 检查认证状态
     */
    async checkAuthentication() {
        try {
            const user = await this.getCurrentUser();
            if (user) {
                this.isAuthenticated = true;
                this.currentUser = user;
                this.emit('authenticated', user);
                return true;
            }
            return false;
        } catch (error) {
            this.isAuthenticated = false;
            this.currentUser = null;
            return false;
        }
    }

    /**
     * 发送 HTTP 请求
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            credentials: 'include',
            ...options
        };

        if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
            if (data instanceof URLSearchParams) {
                // 对于问卷提交，使用form-urlencoded格式
                config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                config.body = data.toString();
            } else if (data instanceof FormData) {
                delete config.headers['Content-Type']; // Let browser set boundary
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // 检查业务状态码 - 支持多种成功状态码
            if (result.code && result.code !== 200 && result.code !== 0) {
                throw new Error(result.message || result.msg || `API Error: ${result.code}`);
            }

            return result;
        } catch (error) {
            this.emit('requestError', { method, endpoint, error });
            throw error;
        }
    }

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        try {
            const result = await this.request('GET', this.endpoints.getUserName);
            return result.data || result;
        } catch (error) {
            throw new Error(`获取用户信息失败: ${error.message}`);
        }
    }

    /**
     * 获取可用任务列表
     */
    async getAvailableTasks(questionnaireType) {
        try {
            const config = this.questionnaireTypes[questionnaireType];
            if (!config) {
                throw new Error(`不支持的问卷类型: ${questionnaireType}`);
            }

            const result = await this.request('GET', this.endpoints.taskTypes, null, {
                headers: {
                    'Referer': `${this.baseUrl}${config.createUrl}`
                }
            });

            return result.data || result.rows || [];
        } catch (error) {
            throw new Error(`获取任务列表失败: ${error.message}`);
        }
    }

    /**
     * 选择项目并获取提交时间范围
     */
    async selectProject(questionnaireType, projectId) {
        try {
            const result = await this.request('GET', 
                `${this.endpoints.submitRange}?projectId=${projectId}`);
            
            return result.data || result;
        } catch (error) {
            throw new Error(`获取项目时间范围失败: ${error.message}`);
        }
    }

    /**
     * 创建联系人 - 支持Legacy模式
     */
    async createContact(contactData) {
        // 如果启用Legacy模式，使用LegacyAPIManager
        if (this.useLegacyMode) {
            console.log(`🔄 使用Legacy模式创建联系人`);
            return await this.legacyApiManager.createContact(contactData);
        }

        // 传统模式
        try {
            // 首先查询是否已存在
            const existingContact = await this.queryContact(contactData.name || contactData.姓名, contactData.assignee || contactData.指派人);
            if (existingContact) {
                return { success: true, existed: true, data: existingContact };
            }

            // 创建新联系人
            const formData = this.buildContactFormData(contactData);
            const result = await this.request('POST', this.endpoints.contactSave, formData);
            
            return { success: true, existed: false, data: result };
        } catch (error) {
            throw new Error(`创建联系人失败: ${error.message}`);
        }
    }

    /**
     * 查询联系人
     */
    async queryContact(name, assignee) {
        try {
            const result = await this.request('GET', 
                `${this.endpoints.contactQuery}?name=${encodeURIComponent(name)}`);
            
            const contacts = result.data || result.rows || [];
            return contacts.find(contact => 
                contact.name === name && contact.assignee === assignee
            );
        } catch (error) {
            // 查询失败不抛出错误，返回 null
            return null;
        }
    }

    /**
     * 构建联系人表单数据
     */
    buildContactFormData(contactData) {
        const formData = new FormData();
        formData.append('name', contactData.姓名);
        formData.append('gender', contactData.性别 || '男');
        formData.append('assignee', contactData.指派人);
        formData.append('contactType', contactData.contactType || '患者');
        
        // 添加其他必要字段
        if (contactData.phone) formData.append('phone', contactData.phone);
        if (contactData.address) formData.append('address', contactData.address);
        
        return formData;
    }

    /**
     * 创建问卷 - 支持Legacy模式
     */
    async createQuestionnaire(questionnaireType, questionnaireData, answers = null) {
        // 如果启用Legacy模式，使用LegacyAPIManager
        if (this.useLegacyMode) {
            console.log(`🔄 使用Legacy模式创建问卷: ${questionnaireType}`);
            
            // 如果未提供答案，自动生成
            if (!answers) {
                answers = this.legacyApiManager.generateAnswers(questionnaireType, questionnaireData);
            }
            
            return await this.legacyApiManager.createQuestionnaire(questionnaireType, questionnaireData, answers);
        }

        // 传统模式
        try {
            const config = this.questionnaireTypes[questionnaireType];
            if (!config) {
                throw new Error(`不支持的问卷类型: ${questionnaireType}`);
            }

            // 获取动态盐值
            const salt = await this.getDynamicsSalt(questionnaireType);
            
            // 构建问卷数据
            const formData = this.buildQuestionnaireFormData(questionnaireType, questionnaireData, salt);
            
            // 提交问卷
            const endpoint = this.endpoints.questionnaireAdd[questionnaireType];
            const result = await this.request('POST', endpoint, formData);
            
            return { success: true, data: result };
        } catch (error) {
            throw new Error(`创建问卷失败: ${error.message}`);
        }
    }

    /**
     * 获取动态盐值
     */
    async getDynamicsSalt(questionnaireType) {
        try {
            const endpoint = this.endpoints.createDynamicsSalt[questionnaireType];
            const result = await this.request('GET', endpoint);
            return result.data || result.salt || '';
        } catch (error) {
            // 如果获取盐值失败，返回空字符串
            return '';
        }
    }

    /**
     * 构建问卷表单数据
     */
    buildQuestionnaireFormData(questionnaireType, data, salt = '') {
        const config = this.questionnaireTypes[questionnaireType];

        // 使用URLSearchParams构建表单数据，匹配知柏问卷的格式
        const formData = new URLSearchParams();

        // 基础字段
        formData.append('recId', '');
        formData.append('projectId', data.projectId || '');
        formData.append('corpId', data.corpId || '1749721838789101');
        formData.append('projectTpl', data.projectTpl || '');
        formData.append('sponsorProjectId', data.sponsorProjectId || '');
        formData.append('isForward', '1');
        formData.append('title', config.name);
        formData.append('way', '实名调查');
        formData.append('startTime', data.时间?.fullDate || new Date().toISOString().split('T')[0]);
        formData.append('memo', data.memo || '');
        formData.append('dcdxName', data.姓名);
        formData.append('fieldName', '性别');
        formData.append('fill', data.性别 || '男');
        formData.append('channelAddress', '');
        formData.append('latLng', '');

        // 添加盐值相关字段和签名
        if (salt) {
            // 使用签名工具生成签名
            SignatureUtils.addSignatureToFormData(formData, salt);
        }

        // 添加nvcVal字段（验证码相关，可能需要从前端获取）
        formData.append('nvcVal', '');

        // 根据问卷类型添加特定字段
        if (questionnaireType === 'liuwei_patient') {
            this.addLiuweiQuestionnaireFields(formData, data);
        } else if (questionnaireType === 'xihuang_consumer') {
            this.addXihuangQuestionnaireFields(formData, data);
        }

        return formData;
    }

    /**
     * 添加六味地黄丸问卷字段
     */
    addLiuweiQuestionnaireFields(formData, data) {
        const answers = this.generateLiuweiQuestions(data);

        // 构建问题和选项字符串（参考知柏问卷格式）
        const questions = [
            "您的用药时长？",
            "您的健康困扰？",
            "您的服用次数？",
            "是否医生建议？",
            "包装偏好？",
            "服用感受？",
            "推荐意愿？",
            "价格敏感度？",
            "症状改善程度？",
            "继续用药意愿？"
        ];

        const options = [
            "1个月以内;1-3个月;3-6个月;6-12个月;12个月以上",
            "腰膝酸软;头晕耳鸣;畏寒怕冷;夜尿频多;其他",
            "每日1次;每日2次;每日3次;其他",
            "是;否",
            "瓶装;盒装;袋装;无偏好",
            "很好;好;一般;不好",
            "非常愿意;愿意;一般;不愿意",
            "非常敏感;敏感;一般;不敏感",
            "显著改善;有所改善;无明显改善;无改善",
            "非常愿意;愿意;一般;不愿意"
        ];

        const types = Array(10).fill("单选项");

        formData.append('questions', questions.join('#'));
        formData.append('options', options.join('#'));
        formData.append('types', types.join('#'));
        formData.append('answers', answers.join('#'));

        // 添加单独的答案字段
        answers.forEach((answer, index) => {
            formData.append(`answer${index}`, answer);
        });

        // 构建加密文本
        const encryptedParams = answers.map((answer, index) => `answer${index}=${encodeURIComponent(answer)}`).join('&');
        formData.append('encryptedText', encryptedParams);
    }

    /**
     * 添加西黄丸问卷字段
     */
    addXihuangQuestionnaireFields(formData, data) {
        const answers = this.generateXihuangQuestions(data);

        // 构建问题和选项字符串（参考知柏问卷格式）
        const questions = [
            "您的购买原因？",
            "使用场景？",
            "购买渠道？",
            "关注因素？",
            "使用频率？",
            "效果评价？",
            "副作用？",
            "价格接受度？",
            "推荐指数？",
            "复购意愿？"
        ];

        const options = [
            "医生推荐;药店推荐;朋友推荐;网上了解;其他",
            "治疗;预防;保健;其他",
            "医院;药店;网上药店;其他",
            "疗效;价格;品牌;安全性;便利性",
            "每日;每周2-3次;每月几次;偶尔使用",
            "非常满意;满意;一般;不满意",
            "无;轻微;明显;严重",
            "完全接受;基本接受;勉强接受;难以接受",
            "10分;9分;8分;7分;6分",
            "肯定会;可能会;不确定;不会"
        ];

        const types = Array(10).fill("单选项");

        formData.append('questions', questions.join('#'));
        formData.append('options', options.join('#'));
        formData.append('types', types.join('#'));
        formData.append('answers', answers.join('#'));

        // 添加单独的答案字段
        answers.forEach((answer, index) => {
            formData.append(`answer${index}`, answer);
        });

        // 构建加密文本
        const encryptedParams = answers.map((answer, index) => `answer${index}=${encodeURIComponent(answer)}`).join('&');
        formData.append('encryptedText', encryptedParams);
    }

    /**
     * 生成六味地黄丸问卷答案
     */
    generateLiuweiQuestions(data) {
        const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomChoice = (choices) => choices[random(0, choices.length - 1)];

        const answers = [];

        // 问题0: 用药时长
        answers[0] = randomChoice([
            "1个月以内",
            "1-3个月",
            "3-6个月",
            "6-12个月",
            "12个月以上"
        ]);

        // 问题1: 健康困扰（多选）
        const healthIssues = ["腰膝酸软", "头晕耳鸣", "畏寒怕冷", "夜尿频多", "其他"];
        const selectedIssues = [];
        const issueCount = random(1, 3);
        for (let i = 0; i < issueCount; i++) {
            const issue = randomChoice(healthIssues.filter(h => !selectedIssues.includes(h)));
            selectedIssues.push(issue);
        }
        answers[1] = selectedIssues.join(',');

        // 问题2: 服用次数
        answers[2] = randomChoice(["每日1次", "每日2次", "每日3次", "其他"]);

        // 问题3: 医生建议
        answers[3] = randomChoice(["是", "否"]);

        // 问题4: 包装偏好
        answers[4] = randomChoice(["瓶装", "盒装", "袋装", "无偏好"]);

        // 问题5: 服用感受
        answers[5] = randomChoice(["很好", "好", "一般", "不好"]);

        // 问题6: 推荐意愿
        answers[6] = randomChoice(["非常愿意", "愿意", "一般", "不愿意"]);

        // 问题7: 价格敏感度
        answers[7] = randomChoice(["非常敏感", "敏感", "一般", "不敏感"]);

        // 问题8: 症状改善程度
        const improvementLevel = randomChoice(["显著改善", "有所改善", "无明显改善", "无改善"]);
        answers[8] = improvementLevel;

        // 问题9: 继续用药意愿（基于症状改善程度）
        if (improvementLevel === "显著改善" || improvementLevel === "有所改善") {
            answers[9] = randomChoice(["非常愿意", "愿意"]);
        } else {
            answers[9] = randomChoice(["一般", "不愿意"]);
        }

        return answers;
    }

    /**
     * 生成西黄丸问卷答案
     */
    generateXihuangQuestions(data) {
        const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomChoice = (choices) => choices[random(0, choices.length - 1)];

        const answers = [];

        // 问题0: 购买原因
        answers[0] = randomChoice(["医生推荐", "药店推荐", "朋友推荐", "网上了解", "其他"]);

        // 问题1: 使用场景
        answers[1] = randomChoice(["治疗", "预防", "保健", "其他"]);

        // 问题2: 购买渠道
        answers[2] = randomChoice(["医院", "药店", "网上药店", "其他"]);

        // 问题3: 关注因素（多选）
        const factors = ["疗效", "价格", "品牌", "安全性", "便利性"];
        const selectedFactors = [];
        const factorCount = random(2, 4);
        for (let i = 0; i < factorCount; i++) {
            const factor = randomChoice(factors.filter(f => !selectedFactors.includes(f)));
            selectedFactors.push(factor);
        }
        answers[3] = selectedFactors.join(',');

        // 问题4: 使用频率
        answers[4] = randomChoice(["每日", "每周2-3次", "每月几次", "偶尔使用"]);

        // 问题5: 效果评价
        answers[5] = randomChoice(["非常满意", "满意", "一般", "不满意"]);

        // 问题6: 副作用
        answers[6] = randomChoice(["无", "轻微", "明显", "严重"]);

        // 问题7: 价格接受度
        answers[7] = randomChoice(["完全接受", "基本接受", "勉强接受", "难以接受"]);

        // 问题8: 推荐指数
        answers[8] = randomChoice(["10分", "9分", "8分", "7分", "6分"]);

        // 问题9: 复购意愿
        answers[9] = randomChoice(["肯定会", "可能会", "不确定", "不会"]);

        return answers;
    }

    /**
     * 获取问卷列表
     */
    async getQuestionnaireList(projectId, date, pageNum = 1, pageSize = 100) {
        try {
            const params = new URLSearchParams({
                searchValue: '',
                pageNum: pageNum.toString(),
                pageSize: pageSize.toString(),
                projectId: projectId.toString(),
                queryState: '-1',
                date: date
            });

            const result = await this.request('GET', 
                `${this.endpoints.questionnaireList}?${params.toString()}`);
            
            return result.rows || [];
        } catch (error) {
            throw new Error(`获取问卷列表失败: ${error.message}`);
        }
    }

    /**
     * 获取区域树
     */
    async getAreaTree() {
        try {
            const result = await this.request('GET', this.endpoints.areaTree);
            return result.data || result;
        } catch (error) {
            throw new Error(`获取区域树失败: ${error.message}`);
        }
    }

    /**
     * 设置基础 URL
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        this.emit('baseUrlChanged', url);
    }

    /**
     * 获取认证状态
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            currentUser: this.currentUser
        };
    }

    /**
     * 清除认证信息
     */
    clearAuth() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.emit('authCleared');
    }
}

module.exports = APIManager;
