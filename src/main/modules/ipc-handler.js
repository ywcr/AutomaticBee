const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');

/**
 * IPC通信处理器
 * 负责处理主进程和渲染进程之间的所有通信
 */
class IPCHandler {
  constructor(managers) {
    this.accountManager = managers.accountManager;
    this.windowManager = managers.windowManager;
    this.taskQueueManager = managers.taskQueueManager;
    this.configManager = managers.configManager;
    this.proxyServer = managers.proxyServer;
    this.apiManager = managers.apiManager;
    
    this.initialize();
  }
  
  /**
   * 初始化IPC处理器
   */
  initialize() {
    console.log('📡 初始化IPC处理器...');
    
    // 账号管理相关
    this.registerAccountHandlers();
    
    // 配置管理相关
    this.registerConfigHandlers();
    
    // 任务管理相关
    this.registerTaskHandlers();
    
    // 文件操作相关
    this.registerFileHandlers();
    
    // 窗口管理相关
    this.registerWindowHandlers();
    
    // 系统相关
    this.registerSystemHandlers();
    
    // API相关
    this.registerApiHandlers();
    
    console.log('✅ IPC处理器初始化完成');
  }
  
  /**
   * 注册账号管理相关的IPC处理器
   */
  registerAccountHandlers() {
    // 获取所有账号
    ipcMain.handle('account:get-all', async () => {
      return this.accountManager.getAllAccounts();
    });
    
    // 获取活跃账号
    ipcMain.handle('account:get-active', async () => {
      return this.accountManager.getActiveAccount();
    });
    
    // 创建账号
    ipcMain.handle('account:create', async (event, accountInfo) => {
      try {
        const account = await this.accountManager.createAccount(accountInfo);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:created', account);
        
        return { success: true, data: account };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 更新账号
    ipcMain.handle('account:update', async (event, accountId, updates) => {
      try {
        const account = await this.accountManager.updateAccount(accountId, updates);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:updated', account);
        
        return { success: true, data: account };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 登录账号
    ipcMain.handle('account:login', async (event, accountId, sessionData) => {
      try {
        const account = await this.accountManager.loginAccount(accountId, sessionData);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:login', account);
        
        return { success: true, data: account };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 注销账号
    ipcMain.handle('account:logout', async (event, accountId) => {
      try {
        const account = await this.accountManager.logoutAccount(accountId);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:logout', account);
        
        return { success: true, data: account };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 删除账号
    ipcMain.handle('account:delete', async (event, accountId) => {
      try {
        await this.accountManager.deleteAccount(accountId);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:deleted', accountId);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 切换账号
    ipcMain.handle('account:switch', async (event, accountId) => {
      try {
        const account = await this.accountManager.switchAccount(accountId);
        
        // 通知所有窗口
        this.windowManager.broadcast('account:switched', account);
        
        return { success: true, data: account };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 打开登录窗口
    ipcMain.handle('account:open-login', async (event, accountId) => {
      try {
        const window = this.windowManager.createLoginWindow(accountId);
        
        // 加载登录页面
        const loginUrl = `${this.configManager.getConfig('api.baseUrl')}/lgb/login.html`;
        window.loadURL(loginUrl);
        
        // 监听登录成功
        window.webContents.on('did-navigate', async (event, url) => {
          // 检查是否登录成功（根据URL判断）
          if (url.includes('/lgb/main') || url.includes('/lgb/mobile')) {
            // 获取cookies
            const cookies = await window.webContents.session.cookies.get({});
            
            // 保存会话
            await this.accountManager.loginAccount(accountId, { cookies });
            
            // 关闭登录窗口
            window.close();
            
            // 通知渲染进程
            this.windowManager.sendToWindow('main', 'account:login-success', accountId);
          }
        });
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
  
  /**
   * 注册配置管理相关的IPC处理器
   */
  registerConfigHandlers() {
    // 获取配置
    ipcMain.handle('config:get', async (event, key) => {
      return this.configManager.getConfig(key);
    });
    
    // 设置配置
    ipcMain.handle('config:set', async (event, key, value) => {
      try {
        this.configManager.setConfig(key, value);
        
        // 通知所有窗口
        this.windowManager.broadcast('config:changed', { key, value });
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 批量更新配置
    ipcMain.handle('config:update', async (event, updates) => {
      try {
        this.configManager.updateConfig(updates);
        
        // 通知所有窗口
        this.windowManager.broadcast('config:updated', updates);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 重置配置
    ipcMain.handle('config:reset', async (event, key) => {
      try {
        this.configManager.resetConfig(key);
        
        // 通知所有窗口
        this.windowManager.broadcast('config:reset', key);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 导出配置
    ipcMain.handle('config:export', async (event) => {
      try {
        const result = await dialog.showSaveDialog({
          title: '导出配置',
          defaultPath: 'jlf-config.json',
          filters: [
            { name: 'JSON文件', extensions: ['json'] },
            { name: '所有文件', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled) {
          await this.configManager.exportConfig(result.filePath);
          return { success: true, filePath: result.filePath };
        }
        
        return { success: false, canceled: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 导入配置
    ipcMain.handle('config:import', async (event) => {
      try {
        const result = await dialog.showOpenDialog({
          title: '导入配置',
          filters: [
            { name: 'JSON文件', extensions: ['json'] },
            { name: '所有文件', extensions: ['*'] }
          ],
          properties: ['openFile']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          await this.configManager.importConfig(result.filePaths[0]);
          return { success: true };
        }
        
        return { success: false, canceled: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 获取问卷类型
    ipcMain.handle('config:get-questionnaire-types', async () => {
      return this.configManager.getAllQuestionnaireTypes();
    });
    
    // 获取Sheet偏好
    ipcMain.handle('config:get-sheet-preference', async (event, type) => {
      return this.configManager.getSheetPreference(type);
    });
    
    // 设置Sheet偏好
    ipcMain.handle('config:set-sheet-preference', async (event, type, sheetName) => {
      this.configManager.setSheetPreference(type, sheetName);
      return { success: true };
    });
  }
  
  /**
   * 注册任务管理相关的IPC处理器
   */
  registerTaskHandlers() {
    // 创建任务
    ipcMain.handle('task:create', async (event, taskData) => {
      try {
        const task = await this.taskQueueManager.createTask(taskData);
        
        // 通知所有窗口
        this.windowManager.broadcast('task:created', task);
        
        return { success: true, data: task };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 开始任务
    ipcMain.handle('task:start', async (event, taskId) => {
      try {
        await this.taskQueueManager.startTask(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 暂停任务
    ipcMain.handle('task:pause', async (event, taskId) => {
      try {
        await this.taskQueueManager.pauseTask(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 恢复任务
    ipcMain.handle('task:resume', async (event, taskId) => {
      try {
        await this.taskQueueManager.resumeTask(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 取消任务
    ipcMain.handle('task:cancel', async (event, taskId) => {
      try {
        await this.taskQueueManager.cancelTask(taskId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 获取任务列表
    ipcMain.handle('task:get-list', async (event, filter) => {
      return this.taskQueueManager.getTasks(filter);
    });
    
    // 获取任务详情
    ipcMain.handle('task:get-detail', async (event, taskId) => {
      return this.taskQueueManager.getTask(taskId);
    });
    
    // 获取任务统计
    ipcMain.handle('task:get-stats', async () => {
      return this.taskQueueManager.getStatistics();
    });
  }
  
  /**
   * 注册文件操作相关的IPC处理器
   */
  registerFileHandlers() {
    // 选择文件
    ipcMain.handle('file:select', async (event, options = {}) => {
      try {
        const result = await dialog.showOpenDialog({
          title: options.title || '选择文件',
          filters: options.filters || [
            { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
            { name: '所有文件', extensions: ['*'] }
          ],
          properties: options.properties || ['openFile']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          return { success: true, filePaths: result.filePaths };
        }
        
        return { success: false, canceled: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 读取文件
    ipcMain.handle('file:read', async (event, filePath, encoding = 'utf-8') => {
      try {
        const content = await fs.readFile(filePath, encoding);
        return { success: true, content };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 保存文件
    ipcMain.handle('file:save', async (event, options) => {
      try {
        const result = await dialog.showSaveDialog({
          title: options.title || '保存文件',
          defaultPath: options.defaultPath,
          filters: options.filters || [
            { name: '所有文件', extensions: ['*'] }
          ]
        });
        
        if (!result.canceled) {
          await fs.writeFile(result.filePath, options.content, options.encoding || 'utf-8');
          return { success: true, filePath: result.filePath };
        }
        
        return { success: false, canceled: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 打开文件夹
    ipcMain.handle('file:open-folder', async (event, folderPath) => {
      try {
        await shell.openPath(folderPath);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 在文件管理器中显示
    ipcMain.handle('file:show-in-folder', async (event, filePath) => {
      try {
        shell.showItemInFolder(filePath);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
  
  /**
   * 注册窗口管理相关的IPC处理器
   */
  registerWindowHandlers() {
    // 最小化窗口
    ipcMain.handle('window:minimize', (event) => {
      const window = this.windowManager.getWindow('main');
      if (window) {
        window.minimize();
      }
    });
    
    // 最大化窗口
    ipcMain.handle('window:maximize', (event) => {
      const window = this.windowManager.getWindow('main');
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      }
    });
    
    // 关闭窗口
    ipcMain.handle('window:close', (event) => {
      const window = this.windowManager.getWindow('main');
      if (window) {
        window.close();
      }
    });
    
    // 重新加载
    ipcMain.handle('window:reload', (event) => {
      const window = this.windowManager.getWindow('main');
      if (window) {
        window.webContents.reload();
      }
    });
    
    // 打开开发者工具
    ipcMain.handle('window:toggle-devtools', (event) => {
      const window = this.windowManager.getWindow('main');
      if (window) {
        this.windowManager.toggleDevTools('main');
      }
    });
    
    // 打开设置窗口
    ipcMain.handle('window:open-settings', (event) => {
      const window = this.windowManager.createSettingsWindow();
      window.loadFile(path.join(__dirname, '../renderer/settings.html'));
    });
  }
  
  /**
   * 注册系统相关的IPC处理器
   */
  registerSystemHandlers() {
    // 获取系统信息
    ipcMain.handle('system:get-info', async () => {
      const os = require('os');
      return {
        platform: process.platform,
        version: os.release(),
        arch: process.arch,
        hostname: os.hostname(),
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem()
        },
        appVersion: require('../../package.json').version
      };
    });
    
    // 打开外部链接
    ipcMain.handle('system:open-external', async (event, url) => {
      try {
        await shell.openExternal(url);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 显示消息框
    ipcMain.handle('system:show-message', async (event, options) => {
      const result = await dialog.showMessageBox(options);
      return result;
    });
    
    // 显示错误框
    ipcMain.handle('system:show-error', (event, title, content) => {
      dialog.showErrorBox(title, content);
    });
    
    // 获取代理状态
    ipcMain.handle('system:get-proxy-status', async () => {
      if (this.proxyServer) {
        return {
          running: this.proxyServer.isRunning(),
          port: this.proxyServer.port,
          host: this.proxyServer.host
        };
      }
      return { running: false };
    });
  }
  
  /**
   * 注册API相关的IPC处理器
   */
  registerApiHandlers() {
    // API请求
    ipcMain.handle('api:request', async (event, options) => {
      try {
        if (!this.apiManager) {
          throw new Error('API管理器未初始化');
        }
        
        const accountId = options.accountId || this.accountManager.activeAccountId;
        const result = await this.apiManager.request(accountId, options);
        
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 检查认证状态
    ipcMain.handle('api:check-auth', async (event, accountId) => {
      try {
        if (!this.apiManager) {
          throw new Error('API管理器未初始化');
        }
        
        const isAuthenticated = await this.apiManager.checkAuthentication(
          accountId || this.accountManager.activeAccountId
        );
        
        return { success: true, authenticated: isAuthenticated };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // 获取用户信息
    ipcMain.handle('api:get-user-info', async (event, accountId) => {
      try {
        if (!this.apiManager) {
          throw new Error('API管理器未初始化');
        }
        
        const userInfo = await this.apiManager.getUserInfo(
          accountId || this.accountManager.activeAccountId
        );
        
        return { success: true, data: userInfo };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    // 移除所有IPC监听器
    ipcMain.removeAllListeners();
  }
}

module.exports = { IPCHandler };