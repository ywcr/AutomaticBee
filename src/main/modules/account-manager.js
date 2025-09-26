const { session } = require('electron');
const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * 账号管理器
 * 负责多账号的登录、会话管理、状态维护
 */
class AccountManager extends EventEmitter {
  constructor(store, electronSession) {
    super();
    this.store = store;
    this.session = electronSession || session;
    this.accounts = new Map(); // 账号ID -> 账号信息
    this.sessions = new Map(); // 账号ID -> session partition
    this.activeAccountId = null;
  }
  
  /**
   * 初始化账号管理器
   */
  async initialize() {
    console.log('📱 初始化账号管理器...');
    
    // 从存储加载账号信息
    const storedAccounts = this.store.get('accounts', []);
    
    for (const account of storedAccounts) {
      // 恢复账号信息
      this.accounts.set(account.id, account);
      
      // 创建或恢复会话
      if (account.sessionData) {
        await this.restoreSession(account.id, account.sessionData);
      }
    }
    
    // 恢复活跃账号
    this.activeAccountId = this.store.get('activeAccountId');
    
    console.log(`✅ 账号管理器初始化完成，已加载 ${this.accounts.size} 个账号`);
  }
  
  /**
   * 生成账号ID
   */
  generateAccountId() {
    return crypto.randomBytes(16).toString('hex');
  }
  
  /**
   * 创建新账号
   */
  async createAccount(accountInfo) {
    const accountId = this.generateAccountId();
    const partitionName = `persist:account-${accountId}`;
    
    // 创建账号对象
    const account = {
      id: accountId,
      phone: accountInfo.phone,
      nickname: accountInfo.nickname || `用户${accountInfo.phone.slice(-4)}`,
      avatar: accountInfo.avatar || null,
      createTime: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
      status: 'pending', // pending, active, expired
      sessionPartition: partitionName,
      sessionData: null,
      metadata: accountInfo.metadata || {}
    };
    
    // 创建独立的session partition
    const accountSession = this.session.fromPartition(partitionName, {
      cache: true
    });
    
    // 配置session
    this.configureSession(accountSession);
    
    // 保存账号
    this.accounts.set(accountId, account);
    this.sessions.set(accountId, accountSession);
    
    // 持久化
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:created', account);
    
    return account;
  }
  
  /**
   * 配置session
   */
  configureSession(accountSession) {
    // 设置User-Agent
    accountSession.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // 配置代理（如果需要）
    const proxyConfig = this.store.get('config.proxy');
    if (proxyConfig && proxyConfig.enabled) {
      accountSession.setProxy({
        proxyRules: `http://127.0.0.1:${proxyConfig.port || 3000}`,
        proxyBypassRules: 'localhost,127.0.0.1'
      });
    }
    
    // 处理证书错误（开发环境）
    if (process.env.NODE_ENV === 'development') {
      accountSession.setCertificateVerifyProc((request, callback) => {
        callback(0); // 0 = 接受所有证书
      });
    }
  }
  
  /**
   * 更新账号信息
   */
  async updateAccount(accountId, updates) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    // 更新账号信息
    Object.assign(account, updates, {
      lastActiveTime: new Date().toISOString()
    });
    
    // 持久化
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:updated', account);
    
    return account;
  }
  
  /**
   * 登录账号（完成验证后调用）
   */
  async loginAccount(accountId, sessionData) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    // 更新账号状态
    account.status = 'active';
    account.sessionData = sessionData;
    account.lastLoginTime = new Date().toISOString();
    
    // 保存cookies等会话数据
    const accountSession = this.sessions.get(accountId);
    if (sessionData.cookies) {
      for (const cookie of sessionData.cookies) {
        await accountSession.cookies.set(cookie);
      }
    }
    
    // 持久化
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:login', account);
    
    return account;
  }
  
  /**
   * 注销账号
   */
  async logoutAccount(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    // 清除会话
    const accountSession = this.sessions.get(accountId);
    if (accountSession) {
      await accountSession.clearStorageData();
    }
    
    // 更新账号状态
    account.status = 'pending';
    account.sessionData = null;
    
    // 如果是活跃账号，切换到下一个
    if (this.activeAccountId === accountId) {
      const nextAccount = this.getNextActiveAccount();
      if (nextAccount) {
        await this.switchAccount(nextAccount.id);
      } else {
        this.activeAccountId = null;
      }
    }
    
    // 持久化
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:logout', account);
    
    return account;
  }
  
  /**
   * 删除账号
   */
  async deleteAccount(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    // 清除会话
    const accountSession = this.sessions.get(accountId);
    if (accountSession) {
      await accountSession.clearStorageData();
    }
    
    // 移除账号
    this.accounts.delete(accountId);
    this.sessions.delete(accountId);
    
    // 如果是活跃账号，切换到下一个
    if (this.activeAccountId === accountId) {
      const nextAccount = this.getNextActiveAccount();
      if (nextAccount) {
        await this.switchAccount(nextAccount.id);
      } else {
        this.activeAccountId = null;
      }
    }
    
    // 持久化
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:deleted', account);
  }
  
  /**
   * 切换活跃账号
   */
  async switchAccount(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    if (account.status !== 'active') {
      throw new Error(`账号 ${account.nickname} 未登录`);
    }
    
    // 更新活跃账号
    this.activeAccountId = accountId;
    account.lastActiveTime = new Date().toISOString();
    
    // 持久化
    this.store.set('activeAccountId', accountId);
    await this.saveAccounts();
    
    // 发出事件
    this.emit('account:switched', account);
    
    return account;
  }
  
  /**
   * 获取账号的session
   */
  getAccountSession(accountId) {
    return this.sessions.get(accountId);
  }
  
  /**
   * 获取活跃账号的session
   */
  getActiveSession() {
    if (!this.activeAccountId) {
      return null;
    }
    return this.sessions.get(this.activeAccountId);
  }
  
  /**
   * 获取所有账号
   */
  getAllAccounts() {
    return Array.from(this.accounts.values());
  }
  
  /**
   * 获取活跃账号
   */
  getActiveAccount() {
    if (!this.activeAccountId) {
      return null;
    }
    return this.accounts.get(this.activeAccountId);
  }
  
  /**
   * 获取下一个活跃账号
   */
  getNextActiveAccount() {
    const accounts = this.getAllAccounts();
    return accounts.find(acc => acc.status === 'active' && acc.id !== this.activeAccountId);
  }
  
  /**
   * 获取账号
   */
  getAccount(accountId) {
    return this.accounts.get(accountId);
  }
  
  /**
   * 检查账号状态
   */
  async checkAccountStatus(accountId) {
    const account = this.accounts.get(accountId);
    if (!account) {
      return { status: 'not_found' };
    }
    
    // TODO: 调用API检查登录状态
    // const isAuthenticated = await this.apiManager.checkAuthentication(accountId);
    
    return {
      status: account.status,
      lastActiveTime: account.lastActiveTime
    };
  }
  
  /**
   * 恢复会话
   */
  async restoreSession(accountId, sessionData) {
    const partitionName = `persist:account-${accountId}`;
    const accountSession = this.session.fromPartition(partitionName, {
      cache: true
    });
    
    // 配置session
    this.configureSession(accountSession);
    
    // 恢复cookies
    if (sessionData && sessionData.cookies) {
      for (const cookie of sessionData.cookies) {
        try {
          await accountSession.cookies.set(cookie);
        } catch (error) {
          console.error(`恢复cookie失败:`, error);
        }
      }
    }
    
    this.sessions.set(accountId, accountSession);
  }
  
  /**
   * 保存账号信息到存储
   */
  async saveAccounts() {
    const accountsArray = Array.from(this.accounts.values()).map(account => {
      // 不保存敏感的session对象，只保存必要的数据
      const { ...accountData } = account;
      return accountData;
    });
    
    this.store.set('accounts', accountsArray);
  }
  
  /**
   * 导出账号会话数据
   */
  async exportSessionData(accountId) {
    const accountSession = this.sessions.get(accountId);
    if (!accountSession) {
      return null;
    }
    
    // 获取所有cookies
    const cookies = await accountSession.cookies.get({});
    
    // 获取localStorage数据（需要在渲染进程中执行）
    // const localStorage = await this.getLocalStorageData(accountId);
    
    return {
      cookies,
      // localStorage,
      exportTime: new Date().toISOString()
    };
  }
  
  /**
   * 导入账号会话数据
   */
  async importSessionData(accountId, sessionData) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`账号 ${accountId} 不存在`);
    }
    
    const accountSession = this.sessions.get(accountId);
    if (!accountSession) {
      throw new Error(`账号 ${accountId} 的会话不存在`);
    }
    
    // 导入cookies
    if (sessionData.cookies) {
      for (const cookie of sessionData.cookies) {
        try {
          await accountSession.cookies.set(cookie);
        } catch (error) {
          console.error(`导入cookie失败:`, error);
        }
      }
    }
    
    // 更新账号状态
    account.sessionData = sessionData;
    account.status = 'active';
    
    await this.saveAccounts();
    
    return account;
  }
}

module.exports = { AccountManager };