const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const Store = require("electron-store");

// 导入自动化模块
const APIManager = require("./api/APIManager");
const TaskAutomationEngine = require("./automation/TaskAutomationEngine");
const DataValidationModule = require("./validation/DataValidationModule");
const { TaskQueueManager, TaskType } = require("./queue/TaskQueueManager");
const ConfigManager = require("./config/ConfigManager");

// 导入任务管理模块
const TaskTypeManager = require("./managers/TaskTypeManager");
const TaskManager = require("./managers/TaskManager");
const TaskValidationManager = require("./managers/TaskValidationManager");
const TaskSettlementManager = require("./managers/TaskSettlementManager");

// 导入多标签管理器
const TabManager = require("./managers/TabManager");

// 创建配置存储
const store = new Store();

// 自动化模块实例
let apiManager;
let automationEngine;
let validationModule;
let queueManager;
let configManager;

// 任务管理模块实例
let taskTypeManager;
let taskManager;
let taskValidationManager;
let taskSettlementManager;

let mainWindow;
let proxyServer;
let windowInstances = new Map(); // 存储所有窗口实例
let windowCounter = 0; // 窗口计数器
let tabManager; // 多标签管理器

// 启动代理服务器
function startProxyServer() {
  const proxyPath = path.join(__dirname, "proxy-server.js");
  proxyServer = spawn("node", [proxyPath], {
    stdio: "inherit",
  });

  proxyServer.on("error", (err) => {
    console.error("代理服务器启动失败:", err);
  });
}

// 创建新窗口实例
function createNewWindow(windowType = 'main') {
  windowCounter++;
  const windowId = `window_${windowCounter}`;
  
  // 创建浏览器窗口
  const newWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true, // 启用 web 安全
      allowRunningInsecureContent: false, // 禁止不安全内容
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../../assets/icon.png"),
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });
  
  // 将窗口添加到管理列表
  windowInstances.set(windowId, {
    window: newWindow,
    type: windowType,
    id: windowId,
    account: null // 存储当前窗口的登录账号
  });
  
  // 如果是第一个窗口，设为主窗口
  if (!mainWindow) {
    mainWindow = newWindow;
  }

  // 等待代理服务器启动后再加载页面
  const checkProxyServer = async () => {
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get('http://localhost:3000/', (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 302); // 允许重定向
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => { // 增加超时时间
        req.destroy();
        resolve(false);
      });
    });
  };

  const waitForProxyServer = async () => {
    let attempts = 0;
    const maxAttempts = 15; // 增加重试次数

    while (attempts < maxAttempts) {
      console.log(`检查代理服务器... 尝试 ${attempts + 1}/${maxAttempts}`);
      const isReady = await checkProxyServer();

      if (isReady) {
        console.log('代理服务器已就绪，加载首页');
        console.log('正在加载 URL: http://localhost:3000/');
        
        try {
          await newWindow.loadURL("http://localhost:3000/");
          console.log('页面加载成功');
        } catch (error) {
          console.error('页面加载失败:', error);
          // 如果加载URL失败，尝试加载本地文件
          newWindow.loadFile(path.join(__dirname, "../renderer/tools-home.html"));
        }
        return;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1500)); // 增加等待时间
    }

    console.error('代理服务器启动超时，回退到本地文件');
    console.log('正在加载本地文件:', path.join(__dirname, "../renderer/tools-home.html"));
    try {
      await newWindow.loadFile(path.join(__dirname, "../renderer/tools-home.html"));
      console.log('本地文件加载成功');
    } catch (error) {
      console.error('本地文件加载也失败:', error);
    }
  };

  // 网页内容事件处理
  newWindow.webContents.on('did-finish-load', () => {
    console.log('页面内容加载完成');
  });

  newWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`页面加载失败: ${errorCode} - ${errorDescription}`);
    console.error(`失败URL: ${validatedURL}`);
    
    // 如果是网络请求失败，尝试加载本地文件
    if (validatedURL.startsWith('http://localhost:3000')) {
      console.log('尝试加载本地文件作为后备');
      newWindow.loadFile(path.join(__dirname, "../renderer/tools-home.html"));
    }
  });

  newWindow.webContents.on('dom-ready', () => {
    console.log('DOM 准备就绪');
  });

  // 延迟启动检查
  setTimeout(waitForProxyServer, 2000); // 减少延迟时间

  // 当窗口准备好时显示
  newWindow.once("ready-to-show", () => {
    console.log('窗口准备好，显示窗口');
    newWindow.show();

    // 开发模式下或者调试模式下打开开发者工具
    if (process.env.NODE_ENV === "development" || process.argv.includes('--debug')) {
      newWindow.webContents.openDevTools();
    }
  });

  // 处理窗口关闭
  newWindow.on("closed", () => {
    // 从管理列表中移除
    windowInstances.delete(windowId);
    
    // 如果关闭的是主窗口，选择一个新的主窗口
    if (newWindow === mainWindow) {
      const remaining = Array.from(windowInstances.values());
      mainWindow = remaining.length > 0 ? remaining[0].window : null;
    }
  });

  // 处理外部链接
  newWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // 仅阻止跳转到外部 http/https 网站，允许应用内部的 file:// 页面导航
  newWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      const isLocalhost = parsedUrl.origin === "http://localhost:3000";
      const isFile = parsedUrl.protocol === "file:";

      if (!isLocalhost && !isFile) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch (e) {
      // 无法解析的 URL，一律阻止
      event.preventDefault();
    }
  });
  
  return newWindow;
}

// 兼容性函数，修改为使用TabManager
function createWindow() {
  // 创建主窗口
  const newWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../../assets/icon.png"),
    show: true, // 直接显示窗口，避免仅使用 BrowserView 时不触发 ready-to-show
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  mainWindow = newWindow;

  // 初始化TabManager
  tabManager = new TabManager(mainWindow);

  // 如果首个标签加载完成且窗口未显示，确保显示窗口
  tabManager.once('tabReady', () => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });
  tabManager.once('tabLoaded', () => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });
  
  // 监听窗口大小变化
  mainWindow.on('resize', () => {
    if (tabManager) {
      tabManager.handleWindowResize();
    }
  });

  // 窗口关闭时清理资源
  mainWindow.on('closed', () => {
    if (tabManager) {
      tabManager.destroy();
      tabManager = null;
    }
    mainWindow = null;
  });

  // 当窗口准备好时显示
  mainWindow.once("ready-to-show", () => {
    console.log('窗口准备好，显示窗口');
    mainWindow.show();

    // 开发模式下或者调试模式下打开开发者工具
    if (process.env.NODE_ENV === "development" || process.argv.includes('--debug')) {
      // 只在需要时才打开DevTools
      // mainWindow.webContents.openDevTools();
    }
  });

  return mainWindow;
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "新建窗口",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            createNewWindow('automation');
          },
        },
        {
          label: "刷新",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            const focused = BrowserWindow.getFocusedWindow();
            if (focused) {
              focused.reload();
            }
          },
        },
        {
          label: "关闭窗口",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            const focused = BrowserWindow.getFocusedWindow();
            if (focused) {
              focused.close();
            }
          },
        },
        { type: "separator" },
        {
          label: "退出",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "重做", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "剪切", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "复制", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "粘贴", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { label: "重新加载", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "强制重新加载",
          accelerator: "CmdOrCtrl+Shift+R",
          role: "forceReload",
        },
        { label: "切换开发者工具", accelerator: "F12", role: "toggleDevTools" },
        { type: "separator" },
        { label: "实际大小", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { label: "放大", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "缩小", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { type: "separator" },
        { label: "切换全屏", accelerator: "F11", role: "togglefullscreen" },
      ],
    },
    {
      label: "窗口",
      submenu: [
        {
          label: "显示所有窗口",
          click: () => {
            windowInstances.forEach(({ window }) => {
              window.show();
            });
          },
        },
        {
          label: "最小化所有窗口",
          click: () => {
            windowInstances.forEach(({ window }) => {
              window.minimize();
            });
          },
        },
        { type: "separator" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "关于",
          click: () => {
            // 显示关于对话框
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 初始化自动化模块
async function initAutomationModules() {
  try {
    // 初始化配置管理器
    configManager = new ConfigManager();

    // 初始化 API 管理器
    apiManager = new APIManager();
    await apiManager.initialize();

    // 初始化自动化引擎
    automationEngine = new TaskAutomationEngine(apiManager);

    // 初始化验证模块
    validationModule = new DataValidationModule(apiManager);

    // 初始化队列管理器
    queueManager = new TaskQueueManager(automationEngine, validationModule);

    // 初始化任务管理模块
    taskTypeManager = new TaskTypeManager();
    taskManager = new TaskManager(apiManager);
    taskValidationManager = new TaskValidationManager(apiManager, taskManager);
    taskSettlementManager = new TaskSettlementManager(apiManager, taskManager);

    // 绑定事件
    bindAutomationEvents();
    bindTaskManagementEvents();

    console.log("自动化模块初始化完成");
  } catch (error) {
    console.error("自动化模块初始化失败:", error);
  }
}

// 绑定自动化事件
function bindAutomationEvents() {
  // 自动化引擎事件
  automationEngine.on("taskStarted", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("task-progress", { type: "started", data });
    }
  });

  automationEngine.on("progress", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("task-progress", { type: "progress", data });
    }
  });

  automationEngine.on("taskCompleted", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("task-completed", data);
    }
  });

  automationEngine.on("taskFailed", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("task-failed", data);
    }
  });

  // 验证模块事件
  validationModule.on("validationCompleted", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("validation-result", data);
    }
  });

  // 队列管理器事件
  queueManager.on("taskStarted", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("queue-task-started", data);
    }
  });

  queueManager.on("taskCompleted", (data) => {
    if (mainWindow) {
      mainWindow.webContents.send("queue-task-completed", data);
    }
  });
}

// 应用准备就绪
app.whenReady().then(async () => {
  // 始终启动代理服务器
  startProxyServer();

  // 初始化自动化模块
  await initAutomationModules();

  // 创建窗口
  createWindow();

  // 创建菜单
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 应用退出时清理
app.on("before-quit", () => {
  if (proxyServer) {
    proxyServer.kill();
  }
});

// IPC 通信处理
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("store-get", (event, key) => {
  return store.get(key);
});

ipcMain.handle("store-set", (event, key, value) => {
  store.set(key, value);
});

// 自动化相关 IPC 处理
ipcMain.handle("get-auth-status", async () => {
  if (!apiManager) return { isAuthenticated: false };
  return apiManager.getAuthStatus();
});

ipcMain.handle("process-excel-file", async (event, filePath) => {
  try {
    if (!automationEngine) throw new Error("自动化引擎未初始化");

    console.log("处理 Excel 文件:", filePath);

    // 检查文件是否存在
    const fs = require("fs");
    if (!fs.existsSync(filePath)) {
      throw new Error("文件不存在: " + filePath);
    }

    // 使用自动化引擎处理 Excel 文件
    const result = await automationEngine.processExcelData(filePath);

    console.log("Excel 文件处理完成:", result);
    return result;
  } catch (error) {
    console.error("Excel 文件处理失败:", error);
    throw error;
  }
});

// 选择Excel文件并在主进程解析
ipcMain.handle("select-excel-file", async () => {
  try {
    if (!automationEngine) throw new Error("自动化引擎未初始化");
    const { dialog } = require("electron");
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "选择Excel文件",
      filters: [
        { name: "Excel文件", extensions: ["xlsx", "xls"] },
        { name: "所有文件", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const filePath = result.filePaths[0];
    const data = await automationEngine.processExcelData(filePath);
    return { success: true, filePath, data };
  } catch (error) {
    console.error("选择/解析Excel失败:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-available-tasks", async (event, questionnaireType) => {
  if (!apiManager) throw new Error("API 管理器未初始化");
  return await apiManager.getAvailableTasks(questionnaireType);
});

ipcMain.handle(
  "select-project",
  async (event, questionnaireType, projectId) => {
    if (!apiManager) throw new Error("API 管理器未初始化");
    return await apiManager.selectProject(questionnaireType, projectId);
  }
);

ipcMain.handle("queue-add-task", async (event, taskConfig) => {
  if (!queueManager) throw new Error("队列管理器未初始化");
  return queueManager.addTask(taskConfig);
});

ipcMain.handle("validate-data", async (event, date, projectId, localData) => {
  if (!validationModule) throw new Error("验证模块未初始化");
  return await validationModule.validateCreatedSurveys(
    date,
    projectId,
    localData
  );
});

ipcMain.handle("get-queue-status", () => {
  if (!queueManager) return null;
  return queueManager.getQueueStatus();
});

ipcMain.handle("get-all-tasks", () => {
  if (!queueManager) return null;
  return queueManager.getAllTasks();
});

ipcMain.handle("pause-queue", () => {
  if (queueManager) queueManager.pause();
});

ipcMain.handle("resume-queue", () => {
  if (queueManager) queueManager.resume();
});

ipcMain.handle("stop-queue", () => {
  if (queueManager) queueManager.stop();
});

ipcMain.handle("clear-queue", (event, type) => {
  if (!queueManager) return;

  switch (type) {
    case "completed":
      queueManager.clearCompleted();
      break;
    case "failed":
      queueManager.clearFailed();
      break;
    case "all":
      queueManager.clearQueue();
      break;
  }
});

// 设置队列并发数
ipcMain.handle("set-queue-concurrency", (event, concurrency) => {
  if (!queueManager) return { success: false, error: "队列管理器未初始化" };
  try {
    queueManager.setMaxConcurrency(Number(concurrency));
    return { success: true, concurrency: Number(concurrency) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-config", (event, key) => {
  if (!configManager) return null;
  return configManager.get(key);
});

// 任务管理相关的IPC处理
ipcMain.handle("get-task-types", () => {
  if (!taskTypeManager) return [];
  return taskTypeManager.getAllMainTypes();
});

ipcMain.handle("create-task", async (event, taskData) => {
  if (!taskManager) throw new Error("任务管理器未初始化");
  return await taskManager.createTask(taskData);
});

ipcMain.handle("get-task", async (event, taskId) => {
  if (!taskManager) throw new Error("任务管理器未初始化");
  return await taskManager.getTask(taskId);
});

ipcMain.handle("update-task", async (event, taskId, updateData) => {
  if (!taskManager) throw new Error("任务管理器未初始化");
  return await taskManager.updateTask(taskId, updateData);
});

ipcMain.handle("delete-task", async (event, taskId) => {
  if (!taskManager) throw new Error("任务管理器未初始化");
  return await taskManager.deleteTask(taskId);
});

ipcMain.handle("search-tasks", async (event, criteria) => {
  if (!taskManager) throw new Error("任务管理器未初始化");
  return await taskManager.searchTasks(criteria);
});

ipcMain.handle("get-task-stats", () => {
  if (!taskManager) return null;
  return taskManager.getTaskStats();
});

// 任务验收相关
ipcMain.handle("create-validation", async (event, taskId, validationData) => {
  if (!taskValidationManager) throw new Error("验收管理器未初始化");
  return await taskValidationManager.createValidation(taskId, validationData);
});

ipcMain.handle("submit-validation-result", async (event, validationId, resultData) => {
  if (!taskValidationManager) throw new Error("验收管理器未初始化");
  return await taskValidationManager.submitValidationResult(validationId, resultData);
});

ipcMain.handle("get-task-validations", async (event, taskId) => {
  if (!taskValidationManager) throw new Error("验收管理器未初始化");
  return await taskValidationManager.getTaskValidations(taskId);
});

// 任务结算相关
ipcMain.handle("create-settlement", async (event, taskId, settlementData) => {
  if (!taskSettlementManager) throw new Error("结算管理器未初始化");
  return await taskSettlementManager.createSettlement(taskId, settlementData);
});

ipcMain.handle("confirm-settlement", async (event, settlementId, confirmData) => {
  if (!taskSettlementManager) throw new Error("结算管理器未初始化");
  return await taskSettlementManager.confirmSettlement(settlementId, confirmData);
});

ipcMain.handle("get-task-settlements", async (event, taskId) => {
  if (!taskSettlementManager) throw new Error("结算管理器未初始化");
  return await taskSettlementManager.getTaskSettlements(taskId);
});

// 绑定任务管理事件
function bindTaskManagementEvents() {
  if (taskManager) {
    taskManager.on('taskCreated', (task) => {
      console.log('任务创建成功:', task.id);
      // 可以发送通知给渲染进程
      if (mainWindow) {
        mainWindow.webContents.send('task-created', task);
      }
    });

    taskManager.on('taskUpdated', (task) => {
      console.log('任务更新成功:', task.id);
      if (mainWindow) {
        mainWindow.webContents.send('task-updated', task);
      }
    });

    taskManager.on('taskDeleted', (task) => {
      console.log('任务删除成功:', task.id);
      if (mainWindow) {
        mainWindow.webContents.send('task-deleted', task);
      }
    });
  }

  if (taskValidationManager) {
    taskValidationManager.on('validationCreated', (validation) => {
      console.log('验收任务创建:', validation.id);
      if (mainWindow) {
        mainWindow.webContents.send('validation-created', validation);
      }
    });

    taskValidationManager.on('validationCompleted', (validation) => {
      console.log('验收完成:', validation.id);
      if (mainWindow) {
        mainWindow.webContents.send('validation-completed', validation);
      }
    });
  }

  if (taskSettlementManager) {
    taskSettlementManager.on('settlementCreated', (settlement) => {
      console.log('结算单创建:', settlement.id);
      if (mainWindow) {
        mainWindow.webContents.send('settlement-created', settlement);
      }
    });

    taskSettlementManager.on('settlementConfirmed', (settlement) => {
      console.log('结算确认:', settlement.id);
      if (mainWindow) {
        mainWindow.webContents.send('settlement-confirmed', settlement);
      }
    });
  }
}

ipcMain.handle("set-config", (event, key, value) => {
  if (!configManager) return;
  configManager.set(key, value);
});

ipcMain.handle("export-config", async (event, filePath) => {
  if (!configManager) throw new Error("配置管理器未初始化");
  return await configManager.exportConfig(filePath);
});

ipcMain.handle("import-config", async (event, filePath, merge) => {
  if (!configManager) throw new Error("配置管理器未初始化");
  return await configManager.importConfig(filePath, merge);
});

// 多窗口管理相关 IPC 处理
ipcMain.handle("create-new-window", async (event, windowType = 'automation') => {
  const newWindow = createNewWindow(windowType);
  return {
    success: true,
    windowId: Array.from(windowInstances.entries()).find(([id, info]) => info.window === newWindow)?.[0]
  };
});

// TabManager IPC 处理器
// 创建新标签
ipcMain.handle("tab-create", async (event, options) => {
  try {
    if (!tabManager) {
      throw new Error('TabManager 未初始化');
    }
    
    const tab = tabManager.createTab(options);
    return {
      success: true,
      tabId: tab.id,
      tab: {
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        url: tab.url,
        isPersistent: tab.isPersistent
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 设置活跃标签
ipcMain.handle("tab-set-active", async (event, tabId) => {
  try {
    if (!tabManager) {
      throw new Error('TabManager 未初始化');
    }
    
    const tab = tabManager.setActiveTab(tabId);
    return {
      success: true,
      tab: {
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        url: tab.url
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 关闭标签
ipcMain.handle("tab-close", async (event, tabId) => {
  try {
    if (!tabManager) {
      throw new Error('TabManager 未初始化');
    }
    
    const success = tabManager.closeTab(tabId);
    return {
      success: success,
      message: success ? '标签已关闭' : '无法关闭该标签'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 获取所有标签
ipcMain.handle("tab-get-all", async (event) => {
  try {
    if (!tabManager) {
      return { success: false, error: 'TabManager 未初始化' };
    }
    
    const tabs = tabManager.getAllTabs().map(tab => ({
      id: tab.id,
      title: tab.title,
      icon: tab.icon,
      url: tab.url,
      isPersistent: tab.isPersistent,
      account: tab.account,
      createdAt: tab.createdAt,
      lastAccessed: tab.lastAccessed
    }));
    
    return {
      success: true,
      tabs: tabs
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 获取指定标签
ipcMain.handle("tab-get", async (event, tabId) => {
  try {
    if (!tabManager) {
      return { success: false, error: 'TabManager 未初始化' };
    }
    
    const tab = tabManager.getTab(tabId);
    if (!tab) {
      return { success: false, error: '标签不存在' };
    }
    
    return {
      success: true,
      tab: {
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        url: tab.url,
        isPersistent: tab.isPersistent,
        account: tab.account
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 获取活跃标签
ipcMain.handle("tab-get-active", async (event) => {
  try {
    if (!tabManager) {
      return { success: false, error: 'TabManager 未初始化' };
    }
    
    const tab = tabManager.getActiveTab();
    if (!tab) {
      return { success: false, error: '没有活跃标签' };
    }
    
    return {
      success: true,
      tab: {
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        url: tab.url,
        account: tab.account
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// 设置标签账号
ipcMain.handle("tab-set-account", async (event, tabId, accountInfo) => {
  try {
    if (!tabManager) {
      throw new Error('TabManager 未初始化');
    }
    
    tabManager.setTabAccount(tabId, accountInfo);
    return {
      success: true,
      message: '账号设置成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle("get-window-list", () => {
  return Array.from(windowInstances.entries()).map(([id, info]) => ({
    id,
    type: info.type,
    account: info.account,
    title: info.window.getTitle()
  }));
});

ipcMain.handle("set-window-account", (event, account) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  const entry = Array.from(windowInstances.entries()).find(([id, info]) => info.window === window);
  if (entry) {
    windowInstances.get(entry[0]).account = account;
    // 更新窗口标题
    window.setTitle(`精灵蜂自动化 - ${account}`);
  }
});

ipcMain.handle("focus-window", (event, windowId) => {
  const windowInfo = windowInstances.get(windowId);
  if (windowInfo) {
    windowInfo.window.show();
    windowInfo.window.focus();
    return { success: true };
  }
  return { success: false, error: "窗口不存在" };
});
