const EventEmitter = require('events');

/**
 * 任务管理器
 */
class TaskManager extends EventEmitter {
  constructor(apiManager) {
    super();
    this.apiManager = apiManager;
    this.tasks = new Map();
  }

  async createTask(taskData) {
    const task = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date(),
      status: 'pending'
    };
    
    this.tasks.set(task.id, task);
    this.emit('taskCreated', task);
    return task;
  }

  async getTask(taskId) {
    return this.tasks.get(taskId);
  }

  async updateTask(taskId, updateData) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    Object.assign(task, updateData);
    this.tasks.set(taskId, task);
    this.emit('taskUpdated', task);
    return task;
  }

  async deleteTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`任务 ${taskId} 不存在`);
    }

    this.tasks.delete(taskId);
    this.emit('taskDeleted', task);
    return task;
  }

  async searchTasks(criteria) {
    const tasks = Array.from(this.tasks.values());
    
    if (!criteria) {
      return tasks;
    }

    return tasks.filter(task => {
      if (criteria.status && task.status !== criteria.status) {
        return false;
      }
      if (criteria.type && task.type !== criteria.type) {
        return false;
      }
      if (criteria.title && !task.title.includes(criteria.title)) {
        return false;
      }
      return true;
    });
  }

  getTaskStats() {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length
    };
  }
}

module.exports = TaskManager;