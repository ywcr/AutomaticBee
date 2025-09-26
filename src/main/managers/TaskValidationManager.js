const EventEmitter = require('events');

/**
 * 任务验收管理器
 */
class TaskValidationManager extends EventEmitter {
  constructor(apiManager, taskManager) {
    super();
    this.apiManager = apiManager;
    this.taskManager = taskManager;
    this.validations = new Map();
  }

  async createValidation(taskId, validationData) {
    const validation = {
      id: Date.now().toString(),
      taskId,
      ...validationData,
      createdAt: new Date(),
      status: 'pending'
    };
    
    this.validations.set(validation.id, validation);
    this.emit('validationCreated', validation);
    return validation;
  }

  async submitValidationResult(validationId, resultData) {
    const validation = this.validations.get(validationId);
    if (!validation) {
      throw new Error(`验收 ${validationId} 不存在`);
    }

    Object.assign(validation, {
      ...resultData,
      status: 'completed',
      completedAt: new Date()
    });

    this.validations.set(validationId, validation);
    this.emit('validationCompleted', validation);
    return validation;
  }

  async getTaskValidations(taskId) {
    const validations = Array.from(this.validations.values());
    return validations.filter(v => v.taskId === taskId);
  }
}

module.exports = TaskValidationManager;