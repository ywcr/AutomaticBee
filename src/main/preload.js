const { contextBridge, ipcRenderer } = require("electron");

// 向渲染进程暴露安全的 API
contextBridge.exposeInMainWorld("electronAPI", {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // 本地存储
  store: {
    get: (key) => ipcRenderer.invoke("store-get", key),
    set: (key, value) => ipcRenderer.invoke("store-set", key, value),
  },

  // 系统信息
  platform: process.platform,

  // 通知
  showNotification: (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  },

  // 请求通知权限
  requestNotificationPermission: async () => {
    if ("Notification" in window) {
      return await Notification.requestPermission();
    }
    return "denied";
  },

  // 认证状态 (直接暴露，保持向后兼容)
  getAuthStatus: () => ipcRenderer.invoke("get-auth-status"),

  // 文件处理 (直接暴露，保持向后兼容)
  processExcelFile: (filePath) =>
    ipcRenderer.invoke("process-excel-file", filePath),

  // 调用系统对话框选择Excel并交由主进程解析
  selectAndProcessExcel: () => ipcRenderer.invoke("select-excel-file"),

  // IPC 通信方法（用于工具间通信）
  send: (channel, data) => ipcRenderer.send(channel, data),

  // 自动化相关 API
  automation: {
    // 认证状态
    getAuthStatus: () => ipcRenderer.invoke("get-auth-status"),

    // 文件处理
    processExcelFile: (filePath) =>
      ipcRenderer.invoke("process-excel-file", filePath),

    // 任务管理
    getAvailableTasks: (questionnaireType) =>
      ipcRenderer.invoke("get-available-tasks", questionnaireType),
    selectProject: (questionnaireType, projectId) =>
      ipcRenderer.invoke("select-project", questionnaireType, projectId),
    createTask: (taskConfig) => ipcRenderer.invoke("queue-add-task", taskConfig),

    // 数据验证
    validateData: (date, projectId, localData) =>
      ipcRenderer.invoke("validate-data", date, projectId, localData),

    // 队列管理
    getQueueStatus: () => ipcRenderer.invoke("get-queue-status"),
    getAllTasks: () => ipcRenderer.invoke("get-all-tasks"),
    pauseQueue: () => ipcRenderer.invoke("pause-queue"),
    resumeQueue: () => ipcRenderer.invoke("resume-queue"),
    stopQueue: () => ipcRenderer.invoke("stop-queue"),
    clearQueue: (type) => ipcRenderer.invoke("clear-queue", type),
    setQueueConcurrency: (concurrency) => ipcRenderer.invoke("set-queue-concurrency", concurrency),

  // 配置管理
  getConfig: (key) => ipcRenderer.invoke("get-config", key),
  setConfig: (key, value) => ipcRenderer.invoke("set-config", key, value),
  exportConfig: (filePath) => ipcRenderer.invoke("export-config", filePath),
  importConfig: (filePath, merge) =>
    ipcRenderer.invoke("import-config", filePath, merge),
},

// 窗口管理
windowManager: {
  createToolWindow: (options) => ipcRenderer.invoke("window-create-tool", options),
  getWindowList: () => ipcRenderer.invoke("window-get-list"),
  focusWindow: (windowId) => ipcRenderer.invoke("window-focus", windowId),
  getDebugInfo: () => ipcRenderer.invoke("window-get-debug-info"),
},

// 多标签管理
tabManager: {
  createTab: (options) => ipcRenderer.invoke("tab-create", options),
  setActiveTab: (tabId) => ipcRenderer.invoke("tab-set-active", tabId),
  closeTab: (tabId) => ipcRenderer.invoke("tab-close", tabId),
  getAllTabs: () => ipcRenderer.invoke("tab-get-all"),
  getTab: (tabId) => ipcRenderer.invoke("tab-get", tabId),
  getActiveTab: () => ipcRenderer.invoke("tab-get-active"),
  setTabAccount: (tabId, accountInfo) => ipcRenderer.invoke("tab-set-account", tabId, accountInfo),
  setCustomTitle: (tabId, customTitle) => ipcRenderer.invoke("tab-set-title", tabId, customTitle),
  clearCustomTitle: (tabId) => ipcRenderer.invoke("tab-clear-custom-title", tabId),
},

  // 事件监听
  onTaskProgress: (callback) => {
    ipcRenderer.on("task-progress", (event, data) => callback(data));
  },

  onTaskCompleted: (callback) => {
    ipcRenderer.on("task-completed", (event, data) => callback(data));
  },

  onTaskFailed: (callback) => {
    ipcRenderer.on("task-failed", (event, data) => callback(data));
  },

  onValidationResult: (callback) => {
    ipcRenderer.on("validation-result", (event, data) => callback(data));
  },

  onQueueTaskStarted: (callback) => {
    ipcRenderer.on("queue-task-started", (event, data) => callback(data));
  },

  onQueueTaskCompleted: (callback) => {
    ipcRenderer.on("queue-task-completed", (event, data) => callback(data));
  },

  // 标签状态变化监听
  onTabsState: (callback) => {
    ipcRenderer.on("tabs:state", (event, data) => callback(data));
  },
});

// 在页面加载完成后执行的初始化代码
window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron 预加载脚本已加载");

  // 请求通知权限
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
