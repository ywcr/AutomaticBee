/**
 * 任务队列管理器
 * 支持任务的排队、执行、暂停、重试等操作
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

// 任务状态枚举
const TaskStatus = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    PAUSED: 'paused'
};

// 任务类型枚举
const TaskType = {
    CREATE_CONTACTS: 'create_contacts',
    CREATE_QUESTIONNAIRES: 'create_questionnaires',
    CREATE_ALL: 'create_all',
    VALIDATE_DATA: 'validate_data',
    RETRY_MISSING: 'retry_missing'
};

class TaskQueueManager extends EventEmitter {
    constructor(automationEngine, validationModule) {
        super();
        this.automationEngine = automationEngine;
        this.validationModule = validationModule;
        
        this.queue = [];
        this.runningTasks = new Map();
        this.completedTasks = [];
        this.failedTasks = [];
        
        this.isProcessing = false;
        this.isPaused = false;
        this.maxConcurrency = 1;
        
        // 绑定自动化引擎事件
        this.bindAutomationEvents();
    }

    /**
     * 绑定自动化引擎事件
     */
    bindAutomationEvents() {
        this.automationEngine.on('taskStarted', (data) => {
            this.emit('taskProgress', { 
                taskId: this.currentTaskId, 
                status: 'started', 
                data 
            });
        });

        this.automationEngine.on('progress', (data) => {
            this.emit('taskProgress', { 
                taskId: this.currentTaskId, 
                status: 'progress', 
                data 
            });
        });

        this.automationEngine.on('taskCompleted', (data) => {
            this.handleTaskCompleted(this.currentTaskId, data);
        });

        this.automationEngine.on('taskFailed', (data) => {
            this.handleTaskFailed(this.currentTaskId, data.error);
        });
    }

    /**
     * 添加任务到队列
     * @param {Object} taskConfig - 任务配置
     * @returns {string} 任务ID
     */
    addTask(taskConfig) {
        const task = {
            id: uuidv4(),
            type: taskConfig.type,
            status: TaskStatus.PENDING,
            priority: taskConfig.priority || 0,
            data: taskConfig.data,
            options: taskConfig.options || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            retryCount: 0,
            maxRetries: taskConfig.maxRetries || 3,
            result: null,
            error: null
        };

        // 按优先级插入队列
        this.insertTaskByPriority(task);
        
        this.emit('taskAdded', task);
        
        // 如果队列没有在处理，开始处理
        if (!this.isProcessing) {
            this.startProcessing();
        }
        
        return task.id;
    }

    /**
     * 按优先级插入任务
     */
    insertTaskByPriority(task) {
        let inserted = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (task.priority > this.queue[i].priority) {
                this.queue.splice(i, 0, task);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.queue.push(task);
        }
    }

    /**
     * 开始处理队列
     */
    async startProcessing() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.emit('processingStarted');
        
        while (this.queue.length > 0 && this.isProcessing && !this.isPaused) {
            // 检查并发限制
            if (this.runningTasks.size >= this.maxConcurrency) {
                await this.delay(1000);
                continue;
            }
            
            const task = this.queue.shift();
            if (task) {
                this.executeTask(task);
            }
        }
        
        // 等待所有运行中的任务完成
        while (this.runningTasks.size > 0) {
            await this.delay(1000);
        }
        
        this.isProcessing = false;
        this.emit('processingCompleted');
    }

    /**
     * 执行单个任务
     */
    async executeTask(task) {
        try {
            task.status = TaskStatus.RUNNING;
            task.updatedAt = new Date();
            this.runningTasks.set(task.id, task);
            this.currentTaskId = task.id;
            
            this.emit('taskStarted', task);
            
            let result;
            switch (task.type) {
                case TaskType.CREATE_CONTACTS:
                    result = await this.executeCreateContactsTask(task);
                    break;
                case TaskType.CREATE_QUESTIONNAIRES:
                    result = await this.executeCreateQuestionnairesTask(task);
                    break;
                case TaskType.CREATE_ALL:
                    result = await this.executeCreateAllTask(task);
                    break;
                case TaskType.VALIDATE_DATA:
                    result = await this.executeValidateDataTask(task);
                    break;
                case TaskType.RETRY_MISSING:
                    result = await this.executeRetryMissingTask(task);
                    break;
                default:
                    throw new Error(`未知的任务类型: ${task.type}`);
            }
            
            this.handleTaskCompleted(task.id, result);
            
        } catch (error) {
            this.handleTaskFailed(task.id, error);
        }
    }

    /**
     * 执行创建联系人任务
     */
    async executeCreateContactsTask(task) {
        const { assignee, data } = task.data;
        return await this.automationEngine.createContacts(assignee, data);
    }

    /**
     * 执行创建问卷任务
     */
    async executeCreateQuestionnairesTask(task) {
        const { assignee, questionnaireType, data } = task.data;
        return await this.automationEngine.createQuestionnaires(assignee, questionnaireType, data);
    }

    /**
     * 执行创建全部任务
     */
    async executeCreateAllTask(task) {
        const { assignee, questionnaireType, data, options } = task.data;
        return await this.automationEngine.executeAssigneeTask(assignee, questionnaireType, data, options);
    }

    /**
     * 执行数据验证任务
     */
    async executeValidateDataTask(task) {
        const { date, projectId, localData } = task.data;
        return await this.validationModule.validateCreatedSurveys(date, projectId, localData);
    }

    /**
     * 执行重试遗漏任务
     */
    async executeRetryMissingTask(task) {
        const { validationResult, localData, questionnaireType } = task.data;
        return await this.validationModule.autoRetryMissing(validationResult, localData, questionnaireType);
    }

    /**
     * 处理任务完成
     */
    handleTaskCompleted(taskId, result) {
        const task = this.runningTasks.get(taskId);
        if (!task) return;
        
        task.status = TaskStatus.COMPLETED;
        task.result = result;
        task.updatedAt = new Date();
        
        this.runningTasks.delete(taskId);
        this.completedTasks.push(task);
        
        this.emit('taskCompleted', task);
    }

    /**
     * 处理任务失败
     */
    handleTaskFailed(taskId, error) {
        const task = this.runningTasks.get(taskId);
        if (!task) return;
        
        task.error = error;
        task.updatedAt = new Date();
        
        // 检查是否需要重试
        if (task.retryCount < task.maxRetries) {
            task.retryCount++;
            task.status = TaskStatus.PENDING;
            this.runningTasks.delete(taskId);
            
            // 重新加入队列
            this.insertTaskByPriority(task);
            this.emit('taskRetry', task);
        } else {
            task.status = TaskStatus.FAILED;
            this.runningTasks.delete(taskId);
            this.failedTasks.push(task);
            this.emit('taskFailed', task);
        }
    }

    /**
     * 暂停队列处理
     */
    pause() {
        this.isPaused = true;
        this.automationEngine.pause();
        this.emit('paused');
    }

    /**
     * 恢复队列处理
     */
    resume() {
        this.isPaused = false;
        this.automationEngine.resume();
        this.emit('resumed');
        
        if (!this.isProcessing && this.queue.length > 0) {
            this.startProcessing();
        }
    }

    /**
     * 停止队列处理
     */
    stop() {
        this.isProcessing = false;
        this.isPaused = false;
        this.automationEngine.stop();
        
        // 取消所有待处理的任务
        this.queue.forEach(task => {
            task.status = TaskStatus.CANCELLED;
            task.updatedAt = new Date();
        });
        this.queue = [];
        
        this.emit('stopped');
    }

    /**
     * 取消特定任务
     */
    cancelTask(taskId) {
        // 从队列中移除
        const queueIndex = this.queue.findIndex(task => task.id === taskId);
        if (queueIndex !== -1) {
            const task = this.queue.splice(queueIndex, 1)[0];
            task.status = TaskStatus.CANCELLED;
            task.updatedAt = new Date();
            this.emit('taskCancelled', task);
            return true;
        }
        
        // 如果是运行中的任务，标记为取消（实际停止需要引擎支持）
        const runningTask = this.runningTasks.get(taskId);
        if (runningTask) {
            runningTask.status = TaskStatus.CANCELLED;
            runningTask.updatedAt = new Date();
            this.emit('taskCancelled', runningTask);
            return true;
        }
        
        return false;
    }

    /**
     * 重试失败的任务
     */
    retryFailedTask(taskId) {
        const taskIndex = this.failedTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return false;
        
        const task = this.failedTasks.splice(taskIndex, 1)[0];
        task.status = TaskStatus.PENDING;
        task.retryCount = 0;
        task.error = null;
        task.updatedAt = new Date();
        
        this.insertTaskByPriority(task);
        this.emit('taskRetry', task);
        
        if (!this.isProcessing) {
            this.startProcessing();
        }
        
        return true;
    }

    /**
     * 清空队列
     */
    clearQueue() {
        this.queue.forEach(task => {
            task.status = TaskStatus.CANCELLED;
            task.updatedAt = new Date();
        });
        this.queue = [];
        this.emit('queueCleared');
    }

    /**
     * 清空已完成的任务
     */
    clearCompleted() {
        this.completedTasks = [];
        this.emit('completedCleared');
    }

    /**
     * 清空失败的任务
     */
    clearFailed() {
        this.failedTasks = [];
        this.emit('failedCleared');
    }

    /**
     * 获取队列状态
     */
    getQueueStatus() {
        return {
            isProcessing: this.isProcessing,
            isPaused: this.isPaused,
            maxConcurrency: this.maxConcurrency,
            pending: this.queue.length,
            running: this.runningTasks.size,
            completed: this.completedTasks.length,
            failed: this.failedTasks.length,
            total: this.queue.length + this.runningTasks.size + this.completedTasks.length + this.failedTasks.length
        };
    }

    /**
     * 获取所有任务
     */
    getAllTasks() {
        return {
            pending: [...this.queue],
            running: Array.from(this.runningTasks.values()),
            completed: [...this.completedTasks],
            failed: [...this.failedTasks]
        };
    }

    /**
     * 获取特定任务
     */
    getTask(taskId) {
        // 在各个列表中查找任务
        let task = this.queue.find(t => t.id === taskId);
        if (task) return task;
        
        task = this.runningTasks.get(taskId);
        if (task) return task;
        
        task = this.completedTasks.find(t => t.id === taskId);
        if (task) return task;
        
        task = this.failedTasks.find(t => t.id === taskId);
        if (task) return task;
        
        return null;
    }

    /**
     * 设置最大并发数
     */
    setMaxConcurrency(maxConcurrency) {
        this.maxConcurrency = Math.max(1, maxConcurrency);
        this.emit('concurrencyChanged', this.maxConcurrency);
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取任务统计信息
     */
    getTaskStats() {
        const stats = {
            total: 0,
            pending: this.queue.length,
            running: this.runningTasks.size,
            completed: this.completedTasks.length,
            failed: this.failedTasks.length,
            cancelled: 0,
            successRate: 0,
            averageExecutionTime: 0
        };
        
        stats.total = stats.pending + stats.running + stats.completed + stats.failed;
        
        if (stats.total > 0) {
            stats.successRate = (stats.completed / (stats.completed + stats.failed) * 100).toFixed(2);
        }
        
        // 计算平均执行时间
        if (this.completedTasks.length > 0) {
            const totalTime = this.completedTasks.reduce((sum, task) => {
                return sum + (task.updatedAt - task.createdAt);
            }, 0);
            stats.averageExecutionTime = Math.round(totalTime / this.completedTasks.length);
        }
        
        return stats;
    }
}

// 导出枚举和类
module.exports = {
    TaskQueueManager,
    TaskStatus,
    TaskType
};
