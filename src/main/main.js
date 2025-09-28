const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// 导入自动化模块
const APIManager = require('./api/APIManager');
const TaskAutomationEngine = require('./automation/TaskAutomationEngine');
const DataValidationModule = require('./validation/DataValidationModule');
const { TaskQueueManager, TaskType } = require('./queue/TaskQueueManager');
const ConfigManager = require('./config/ConfigManager');

// 导入任务管理模块
const TaskTypeManager = require('./managers/TaskTypeManager');
const TaskManager = require('./managers/TaskManager');
const TaskValidationManager = require('./managers/TaskValidationManager');
const TaskSettlementManager = require('./managers/TaskSettlementManager');

// 导入新的窗口和标签管理架构
const WindowFactory = require('./windows/WindowFactory');
const { tabManagerRegistry } = require('./managers/TabManagerRegistry');
const { WindowIPCHandler } = require('./ipc/WindowIPCHandler');
const { tabIPCHandler } = require('./ipc/TabIPCHandler');

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

// 新的窗口管理架构
let windowFactory;
let windowIPCHandler;
let proxyServer;

// 启动代理服务器
function startProxyServer() {
    const proxyPath = path.join(__dirname, 'proxy-server.js');
    proxyServer = spawn('node', [proxyPath], {
        stdio: 'inherit',
    });

    proxyServer.on('error', (err) => {
        console.error('代理服务器启动失败:', err);
    });

    console.log('代理服务器已启动');
}

// 等待代理服务器就绪
async function waitForProxyReady() {
    const maxRetries = 30; // 最多30次重试，每次间1秒
    const delay = 1000;
    
    console.log('等待代理服务器就绪...');
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const fetch = require('electron-fetch').default;
            const response = await fetch('http://localhost:3000/health', {
                timeout: 2000
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'ok') {
                    console.log('代理服务器就绪完成');
                    return true;
                }
            }
        } catch (error) {
            // 忽略连接错误，继续重试
        }
        
        console.log(`代理服务器未就绪，第 ${i + 1}/${maxRetries} 次重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.error('等待代理服务器就绪超时');
    return false;
}

// 创建应用菜单
function createMenu() {
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '新建工具窗口',
                    accelerator: 'CmdOrCtrl+N',
                    click: async () => {
                        if (windowFactory) {
                            windowFactory.createToolWindow();
                        }
                    },
                },
                {
                    label: '刷新',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;
                        const tabManager = tabManagerRegistry.getManager(focused.id);
                        if (tabManager) {
                            const activeTab = tabManager.getActiveTab();
                            if (activeTab && activeTab.view && activeTab.view.webContents) {
                                activeTab.view.webContents.reload();
                                return;
                            }
                        }
                        focused.reload();
                    },
                },
                {
                    label: '关闭窗口',
                    accelerator: 'CmdOrCtrl+W',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (focused) {
                            focused.close();
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
            ],
        },
        {
            label: '视图',
            submenu: [
                {
                    label: '重新加载',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;
                        const tabManager = tabManagerRegistry.getManager(focused.id);
                        if (tabManager) {
                            const activeTab = tabManager.getActiveTab();
                            if (activeTab && activeTab.view && activeTab.view.webContents) {
                                activeTab.view.webContents.reload();
                                return;
                            }
                        }
                        focused.reload();
                    }
                },
                {
                    label: '强制重新加载',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;
                        const tabManager = tabManagerRegistry.getManager(focused.id);
                        if (tabManager) {
                            const activeTab = tabManager.getActiveTab();
                            if (activeTab && activeTab.view && activeTab.view.webContents) {
                                // 尽量清理缓存再忽略缓存刷新
                                try {
                                    const wc = activeTab.view.webContents;
                                    wc.session.clearCache().finally(() => wc.reloadIgnoringCache());
                                } catch {
                                    activeTab.view.webContents.reloadIgnoringCache();
                                }
                                return;
                            }
                        }
                        // 回退到窗口级的忽略缓存刷新
                        try {
                            focused.webContents.session.clearCache().finally(() => focused.webContents.reloadIgnoringCache());
                        } catch {
                            focused.webContents.reloadIgnoringCache();
                        }
                    }
                },
                {
                    label: '切换开发者工具',
                    accelerator: 'F12',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;

                        // 优先通过 TabManager 打开当前 BrowserView 的 DevTools
                        const tabManager = tabManagerRegistry.getManager(focused.id);
                        if (tabManager) {
                            const activeTab = tabManager.getActiveTab();
                            if (activeTab && activeTab.view && activeTab.view.webContents) {
                                activeTab.view.webContents.openDevTools({ mode: 'detach' });
                                return;
                            }
                        }

                        // 次优：枚举窗口中的 BrowserView 并打开第一个的 DevTools
                        const views = focused.getBrowserViews();
                        if (views && views.length > 0) {
                            views[0].webContents.openDevTools({ mode: 'detach' });
                            return;
                        }

                        // 最后回退：打开窗口自身的 DevTools
                        focused.webContents.openDevTools({ mode: 'detach' });
                    }
                },
                { type: 'separator' },
                { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '切换全屏', accelerator: 'F11', role: 'togglefullscreen' },
            ],
        },
        {
            label: '窗口',
            submenu: [
                {
                    label: '显示所有窗口',
                    click: () => {
                        const mainWindow = windowFactory?.getMainWindow();
                        const toolWindows = windowFactory?.getToolWindows() || [];

                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.show();
                        }

                        toolWindows.forEach(({ window }) => {
                            if (!window.isDestroyed()) {
                                window.show();
                            }
                        });
                    },
                },
                {
                    label: '最小化所有窗口',
                    click: () => {
                        const mainWindow = windowFactory?.getMainWindow();
                        const toolWindows = windowFactory?.getToolWindows() || [];

                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.minimize();
                        }

                        toolWindows.forEach(({ window }) => {
                            if (!window.isDestroyed()) {
                                window.minimize();
                            }
                        });
                    },
                },
                { type: 'separator' },
                {
                    label: '上一标签',
                    accelerator: 'CmdOrCtrl+Alt+Left',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;
                        const tm = tabManagerRegistry.getManager(focused.id);
                        if (!tm) return;
                        const tabs = tm.getAllTabs();
                        if (!tabs.length) return;
                        const activeId = tm.getActiveTabId?.() || (tm.getActiveTab()?.id);
                        const idx = tabs.findIndex(t => t.id === activeId);
                        const prevIdx = (idx <= 0) ? tabs.length - 1 : idx - 1;
                        tm.setActiveTab(tabs[prevIdx].id);
                    }
                },
                {
                    label: '下一标签',
                    accelerator: 'CmdOrCtrl+Alt+Right',
                    click: () => {
                        const focused = BrowserWindow.getFocusedWindow();
                        if (!focused) return;
                        const tm = tabManagerRegistry.getManager(focused.id);
                        if (!tm) return;
                        const tabs = tm.getAllTabs();
                        if (!tabs.length) return;
                        const activeId = tm.getActiveTabId?.() || (tm.getActiveTab()?.id);
                        const idx = tabs.findIndex(t => t.id === activeId);
                        const nextIdx = (idx + 1) % tabs.length;
                        tm.setActiveTab(tabs[nextIdx].id);
                    }
                },
            ],
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        // 显示关于对话框
                        console.log('显示关于对话框');
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 创建Excel审核工具窗口
function createExcelReviewWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 900,
        webPreferences: {
            preload: path.resolve(__dirname, './preloads/excel-review-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true,
        },
        title: 'Excel 审核工具',
        icon: path.join(__dirname, '../assets/icon.png'), // 如果有图标的话
    });

    // 加载静态导出的 index-electron.html
    const filePath = path.resolve(__dirname, '../renderer/tools/excel-review/index-electron.html');
    win.loadFile(filePath);

    // 打开开发者工具（在开发环境下）
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    }

    return win;
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

        console.log('自动化模块初始化完成');
    } catch (error) {
        console.error('自动化模块初始化失败:', error);
    }
}

// 绑定自动化事件
function bindAutomationEvents() {
    // 自动化引擎事件
    automationEngine.on('taskStarted', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('task-progress', { type: 'started', data });
        }
    });

    automationEngine.on('progress', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('task-progress', { type: 'progress', data });
        }
    });

    automationEngine.on('taskCompleted', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('task-completed', data);
        }
    });

    automationEngine.on('taskFailed', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('task-failed', data);
        }
    });

    // 验证模块事件
    validationModule.on('validationCompleted', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('validation-result', data);
        }
    });

    // 队列管理器事件
    queueManager.on('taskStarted', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('queue-task-started', data);
        }
    });

    queueManager.on('taskCompleted', (data) => {
        const mainWindow = windowFactory?.getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('queue-task-completed', data);
        }
    });
}

// 绑定任务管理事件
function bindTaskManagementEvents() {
    if (taskManager) {
        taskManager.on('taskCreated', (task) => {
            console.log('任务创建成功:', task.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('task-created', task);
            }
        });

        taskManager.on('taskUpdated', (task) => {
            console.log('任务更新成功:', task.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('task-updated', task);
            }
        });

        taskManager.on('taskDeleted', (task) => {
            console.log('任务删除成功:', task.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('task-deleted', task);
            }
        });
    }

    if (taskValidationManager) {
        taskValidationManager.on('validationCreated', (validation) => {
            console.log('验收任务创建:', validation.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('validation-created', validation);
            }
        });

        taskValidationManager.on('validationCompleted', (validation) => {
            console.log('验收完成:', validation.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('validation-completed', validation);
            }
        });
    }

    if (taskSettlementManager) {
        taskSettlementManager.on('settlementCreated', (settlement) => {
            console.log('结算单创建:', settlement.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('settlement-created', settlement);
            }
        });

        taskSettlementManager.on('settlementConfirmed', (settlement) => {
            console.log('结算确认:', settlement.id);
            const mainWindow = windowFactory?.getMainWindow();
            if (mainWindow) {
                mainWindow.webContents.send('settlement-confirmed', settlement);
            }
        });
    }
}

// 注册通用 IPC 处理器
function registerCommonIPCHandlers() {
    // 应用版本
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    // 存储操作
    ipcMain.handle('store-get', (event, key) => {
        return store.get(key);
    });

    ipcMain.handle('store-set', (event, key, value) => {
        store.set(key, value);
    });

    // 自动化相关
    ipcMain.handle('get-auth-status', async () => {
        if (!apiManager) return { isAuthenticated: false };
        return apiManager.getAuthStatus();
    });

    ipcMain.handle('process-excel-file', async (event, filePath) => {
        try {
            if (!automationEngine) throw new Error('自动化引擎未初始化');
            console.log('处理 Excel 文件:', filePath);

            const fs = require('fs');
            if (!fs.existsSync(filePath)) {
                throw new Error('文件不存在: ' + filePath);
            }

            const result = await automationEngine.processExcelData(filePath);
            console.log('Excel 文件处理完成:', result);
            return result;
        } catch (error) {
            console.error('Excel 文件处理失败:', error);
            throw error;
        }
    });

    ipcMain.handle('select-excel-file', async () => {
        try {
            if (!automationEngine) throw new Error('自动化引擎未初始化');
            const { dialog } = require('electron');
            const mainWindow = windowFactory?.getMainWindow();
            
            const result = await dialog.showOpenDialog(mainWindow, {
                title: '选择Excel文件',
                filters: [
                    { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
                    { name: '所有文件', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, canceled: true };
            }

            const filePath = result.filePaths[0];
            const data = await automationEngine.processExcelData(filePath);
            return { success: true, filePath, data };
        } catch (error) {
            console.error('选择/解析Excel失败:', error);
            return { success: false, error: error.message };
        }
    });

    // 其他自动化相关 IPC（保持现有逻辑）
    registerAutomationIPCHandlers();
    registerTaskManagementIPCHandlers();
}

// 注册自动化相关 IPC
function registerAutomationIPCHandlers() {
    ipcMain.handle('get-available-tasks', async (event, questionnaireType) => {
        if (!apiManager) throw new Error('API 管理器未初始化');
        return await apiManager.getAvailableTasks(questionnaireType);
    });

    ipcMain.handle('select-project', async (event, questionnaireType, projectId) => {
        if (!apiManager) throw new Error('API 管理器未初始化');
        return await apiManager.selectProject(questionnaireType, projectId);
    });

    ipcMain.handle('queue-add-task', async (event, taskConfig) => {
        if (!queueManager) throw new Error('队列管理器未初始化');
        return queueManager.addTask(taskConfig);
    });

    ipcMain.handle('validate-data', async (event, date, projectId, localData) => {
        if (!validationModule) throw new Error('验证模块未初始化');
        return await validationModule.validateCreatedSurveys(date, projectId, localData);
    });

    ipcMain.handle('get-queue-status', () => {
        if (!queueManager) return null;
        return queueManager.getQueueStatus();
    });

    ipcMain.handle('get-all-tasks', () => {
        if (!queueManager) return null;
        return queueManager.getAllTasks();
    });

    ipcMain.handle('pause-queue', () => {
        if (queueManager) queueManager.pause();
    });

    ipcMain.handle('resume-queue', () => {
        if (queueManager) queueManager.resume();
    });

    ipcMain.handle('stop-queue', () => {
        if (queueManager) queueManager.stop();
    });

    ipcMain.handle('clear-queue', (event, type) => {
        if (!queueManager) return;

        switch (type) {
            case 'completed':
                queueManager.clearCompleted();
                break;
            case 'failed':
                queueManager.clearFailed();
                break;
            case 'all':
                queueManager.clearQueue();
                break;
        }
    });

    ipcMain.handle('set-queue-concurrency', (event, concurrency) => {
        if (!queueManager) return { success: false, error: '队列管理器未初始化' };
        try {
            queueManager.setMaxConcurrency(Number(concurrency));
            return { success: true, concurrency: Number(concurrency) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-config', (event, key) => {
        if (!configManager) return null;
        return configManager.get(key);
    });

    ipcMain.handle('set-config', (event, key, value) => {
        if (!configManager) return;
        configManager.set(key, value);
    });

    ipcMain.handle('export-config', async (event, filePath) => {
        if (!configManager) throw new Error('配置管理器未初始化');
        return await configManager.exportConfig(filePath);
    });

    ipcMain.handle('import-config', async (event, filePath, merge) => {
        if (!configManager) throw new Error('配置管理器未初始化');
        return await configManager.importConfig(filePath, merge);
    });

    // Excel审核工具相关
    ipcMain.on('open-tool', (event, toolName) => {
        if (toolName === 'excel-review') {
            createExcelReviewWindow();
        }
    });

    // Excel审核工具文件对话框
    ipcMain.handle('dialog:openFile', async () => {
        const { dialog } = require('electron');
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Excel Files', extensions: ['xlsx', 'xlsm', 'xlsb'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });
        
        if (result.canceled || !result.filePaths?.[0]) {
            return null;
        }
        
        return result.filePaths[0]; // 返回文件路径
    });

    // Excel审核工具验证任务
    ipcMain.handle('excel:start-validation', async (event, payload) => {
        const { filePath, options } = payload || {};
        if (!filePath) {
            throw new Error('filePath is required');
        }

        const { Worker } = require('worker_threads');
        const workerPath = path.resolve(__dirname, './workers/excel-validation-worker.js');

        return new Promise((resolve, reject) => {
            const worker = new Worker(workerPath, {
                workerData: { filePath, options },
            });

            // 监听 worker 事件并转发给渲染进程
            worker.on('message', (msg) => {
                if (!msg || typeof msg !== 'object') return;
                
                if (msg.type === 'progress') {
                    event.sender.send('excel:update-progress', msg);
                } else if (msg.type === 'error') {
                    event.sender.send('excel:error', msg);
                } else if (msg.type === 'done') {
                    event.sender.send('excel:done', msg.result);
                    resolve(msg.result);
                }
            });

            worker.on('error', (err) => {
                const errorMsg = { message: err?.message || String(err) };
                event.sender.send('excel:error', errorMsg);
                reject(err);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    const err = new Error(`Worker stopped with exit code ${code}`);
                    event.sender.send('excel:error', { message: err.message });
                    reject(err);
                }
            });
        });
    });
}

// 注册任务管理相关 IPC
function registerTaskManagementIPCHandlers() {
    ipcMain.handle('get-task-types', () => {
        if (!taskTypeManager) return [];
        return taskTypeManager.getAllMainTypes();
    });

    ipcMain.handle('create-task', async (event, taskData) => {
        if (!taskManager) throw new Error('任务管理器未初始化');
        return await taskManager.createTask(taskData);
    });

    ipcMain.handle('get-task', async (event, taskId) => {
        if (!taskManager) throw new Error('任务管理器未初始化');
        return await taskManager.getTask(taskId);
    });

    ipcMain.handle('update-task', async (event, taskId, updateData) => {
        if (!taskManager) throw new Error('任务管理器未初始化');
        return await taskManager.updateTask(taskId, updateData);
    });

    ipcMain.handle('delete-task', async (event, taskId) => {
        if (!taskManager) throw new Error('任务管理器未初始化');
        return await taskManager.deleteTask(taskId);
    });

    ipcMain.handle('search-tasks', async (event, criteria) => {
        if (!taskManager) throw new Error('任务管理器未初始化');
        return await taskManager.searchTasks(criteria);
    });

    ipcMain.handle('get-task-stats', () => {
        if (!taskManager) return null;
        return taskManager.getTaskStats();
    });

    // 任务验收相关
    ipcMain.handle('create-validation', async (event, taskId, validationData) => {
        if (!taskValidationManager) throw new Error('验收管理器未初始化');
        return await taskValidationManager.createValidation(taskId, validationData);
    });

    ipcMain.handle('submit-validation-result', async (event, validationId, resultData) => {
        if (!taskValidationManager) throw new Error('验收管理器未初始化');
        return await taskValidationManager.submitValidationResult(validationId, resultData);
    });

    ipcMain.handle('get-task-validations', async (event, taskId) => {
        if (!taskValidationManager) throw new Error('验收管理器未初始化');
        return await taskValidationManager.getTaskValidations(taskId);
    });

    // 任务结算相关
    ipcMain.handle('create-settlement', async (event, taskId, settlementData) => {
        if (!taskSettlementManager) throw new Error('结算管理器未初始化');
        return await taskSettlementManager.createSettlement(taskId, settlementData);
    });

    ipcMain.handle('confirm-settlement', async (event, settlementId, confirmData) => {
        if (!taskSettlementManager) throw new Error('结算管理器未初始化');
        return await taskSettlementManager.confirmSettlement(settlementId, confirmData);
    });

    ipcMain.handle('get-task-settlements', async (event, taskId) => {
        if (!taskSettlementManager) throw new Error('结算管理器未初始化');
        return await taskSettlementManager.getTaskSettlements(taskId);
    });
}

// 禁用硬件加速（防止黑屏问题）- 必须在 app.whenReady() 之前调用
app.disableHardwareAcceleration();

// 应用准备就绪
app.whenReady().then(async () => {
    console.log('Electron 应用准备就绪');

    // 启动代理服务器
    startProxyServer();
    
    // 等待代理服务器就绪
    const proxyReady = await waitForProxyReady();
    if (!proxyReady) {
        console.error('代理服务器启动失败，应用无法正常工作');
        // 可以选择继续启动但显示错误，或者退出应用
    }

    // 初始化窗口工厂
    windowFactory = new WindowFactory(store);

    // 初始化 IPC 处理器
    windowIPCHandler = new WindowIPCHandler(windowFactory, tabManagerRegistry);
    // tabIPCHandler 已在模块加载时初始化

    // 注册通用 IPC 处理器
    registerCommonIPCHandlers();

    // 初始化自动化模块
    await initAutomationModules();

    // 创建主窗口
    windowFactory.createMainWindow();

    // 创建菜单
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            windowFactory.createMainWindow();
        }
    });

    console.log('应用初始化完成');
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 应用退出时清理
app.on('before-quit', () => {
    console.log('应用正在退出，清理资源...');

    // 清理代理服务器
    if (proxyServer) {
        proxyServer.kill();
        console.log('代理服务器已停止');
    }

    // 清理 TabManager 实例
    tabManagerRegistry.destroyAll();

    // 清理 IPC 处理器
    if (windowIPCHandler) {
        windowIPCHandler.cleanup();
    }
    
    if (tabIPCHandler) {
        tabIPCHandler.cleanup();
    }

    console.log('资源清理完成');
});