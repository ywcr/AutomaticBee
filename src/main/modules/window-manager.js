const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * 窗口管理器
 * 负责创建、管理、销毁应用窗口
 */
class WindowManager {
  constructor(store, configManager) {
    this.store = store;
    this.configManager = configManager;
    this.windows = new Map(); // 窗口ID -> BrowserWindow实例
  }
  
  /**
   * 创建窗口
   */
  createWindow(windowId, options = {}) {
    // 如果窗口已存在，直接返回
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow.focus();
      return existingWindow;
    }
    
    // 默认窗口配置
    const defaultOptions = {
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      center: true,
      show: false, // 先隐藏，加载完成后再显示
      backgroundColor: '#ffffff',
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
        webSecurity: process.env.NODE_ENV !== 'development'
      }
    };
    
    // 合并配置
    const windowOptions = { ...defaultOptions, ...options };
    
    // 恢复窗口位置和大小（如果有保存的）
    const savedBounds = this.store.get(`window.${windowId}.bounds`);
    if (savedBounds) {
      windowOptions.x = savedBounds.x;
      windowOptions.y = savedBounds.y;
      windowOptions.width = savedBounds.width;
      windowOptions.height = savedBounds.height;
    }
    
    // 创建窗口
    const window = new BrowserWindow(windowOptions);
    
    // 保存窗口引用
    this.windows.set(windowId, window);
    
    // 窗口准备好后显示
    window.once('ready-to-show', () => {
      window.show();
    });
    
    // 保存窗口位置和大小
    window.on('close', () => {
      const bounds = window.getBounds();
      this.store.set(`window.${windowId}.bounds`, bounds);
    });
    
    // 窗口关闭后清理引用
    window.on('closed', () => {
      this.windows.delete(windowId);
    });
    
    return window;
  }
  
  /**
   * 获取窗口
   */
  getWindow(windowId) {
    return this.windows.get(windowId);
  }
  
  /**
   * 获取所有窗口
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }
  
  /**
   * 关闭窗口
   */
  closeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.close();
    }
  }
  
  /**
   * 关闭所有窗口
   */
  closeAllWindows() {
    this.windows.forEach((window, id) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
  }
  
  /**
   * 移除窗口引用
   */
  removeWindow(windowId) {
    this.windows.delete(windowId);
  }
  
  /**
   * 创建账号登录窗口
   */
  createLoginWindow(accountId) {
    const windowId = `login-${accountId}`;
    
    const window = this.createWindow(windowId, {
      width: 500,
      height: 700,
      resizable: false,
      minimizable: false,
      maximizable: false,
      title: '账号登录',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js'),
        partition: `persist:account-${accountId}` // 使用账号的session partition
      }
    });
    
    return window;
  }
  
  /**
   * 创建设置窗口
   */
  createSettingsWindow() {
    const windowId = 'settings';
    
    // 如果设置窗口已存在，直接激活它
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow.focus();
      return existingWindow;
    }
    
    const window = this.createWindow(windowId, {
      width: 900,
      height: 600,
      title: '设置',
      parent: this.getWindow('main'),
      modal: false,
      show: false
    });
    
    return window;
  }
  
  /**
   * 创建关于窗口
   */
  createAboutWindow() {
    const windowId = 'about';
    
    if (this.windows.has(windowId)) {
      const existingWindow = this.windows.get(windowId);
      existingWindow.focus();
      return existingWindow;
    }
    
    const window = this.createWindow(windowId, {
      width: 400,
      height: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
      title: '关于',
      parent: this.getWindow('main'),
      modal: true,
      show: false
    });
    
    return window;
  }
  
  /**
   * 发送消息到窗口
   */
  sendToWindow(windowId, channel, ...args) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.webContents.send(channel, ...args);
    }
  }
  
  /**
   * 广播消息到所有窗口
   */
  broadcast(channel, ...args) {
    this.windows.forEach((window, id) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    });
  }
  
  /**
   * 重新加载窗口
   */
  reloadWindow(windowId) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      window.webContents.reload();
    }
  }
  
  /**
   * 打开开发者工具
   */
  toggleDevTools(windowId) {
    const window = this.windows.get(windowId);
    if (window && !window.isDestroyed()) {
      if (window.webContents.isDevToolsOpened()) {
        window.webContents.closeDevTools();
      } else {
        window.webContents.openDevTools();
      }
    }
  }
}

module.exports = { WindowManager };