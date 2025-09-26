const EventEmitter = require('events');

/**
 * 任务结算管理器
 */
class TaskSettlementManager extends EventEmitter {
  constructor(apiManager, taskManager) {
    super();
    this.apiManager = apiManager;
    this.taskManager = taskManager;
    this.settlements = new Map();
  }

  async createSettlement(taskId, settlementData) {
    const settlement = {
      id: Date.now().toString(),
      taskId,
      ...settlementData,
      createdAt: new Date(),
      status: 'pending'
    };
    
    this.settlements.set(settlement.id, settlement);
    this.emit('settlementCreated', settlement);
    return settlement;
  }

  async confirmSettlement(settlementId, confirmData) {
    const settlement = this.settlements.get(settlementId);
    if (!settlement) {
      throw new Error(`结算 ${settlementId} 不存在`);
    }

    Object.assign(settlement, {
      ...confirmData,
      status: 'confirmed',
      confirmedAt: new Date()
    });

    this.settlements.set(settlementId, settlement);
    this.emit('settlementConfirmed', settlement);
    return settlement;
  }

  async getTaskSettlements(taskId) {
    const settlements = Array.from(this.settlements.values());
    return settlements.filter(s => s.taskId === taskId);
  }
}

module.exports = TaskSettlementManager;