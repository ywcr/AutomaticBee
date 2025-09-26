/**
 * 任务类型管理器
 */
class TaskTypeManager {
  constructor() {
    this.taskTypes = [
      {
        id: 'contacts',
        name: '联系人任务',
        description: '创建和管理联系人'
      },
      {
        id: 'questionnaires', 
        name: '问卷任务',
        description: '创建和分发问卷'
      },
      {
        id: 'surveys',
        name: '调研任务', 
        description: '执行调研和数据收集'
      }
    ];
  }

  getAllMainTypes() {
    return this.taskTypes;
  }

  getTaskType(id) {
    return this.taskTypes.find(type => type.id === id);
  }

  addTaskType(taskType) {
    this.taskTypes.push(taskType);
  }
}

module.exports = TaskTypeManager;