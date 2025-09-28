/**
 * WindowFactory - 窗口工厂
 * 负责创建不同类型的窗口（主窗口、工具窗口等）
 */

const { BrowserWindow } = require('electron');
const path = require('path');
const TabManager = require('../managers/TabManager');
const { HeaderViewManager } = require('../managers/HeaderViewManager');
const {
    MIN_WINDOW_WIDTH,
    MIN_WINDOW_HEIGHT,
    DEFAULT_WINDOW_WIDTH,
    DEFAULT_WINDOW_HEIGHT
} = require('../config/LayoutConstants');
const { tabManagerRegistry } = require('../managers/TabManagerRegistry');

class WindowFactory {
    constructor(store) {
        this.store = store;
        this.mainWindow = null;
        this.toolWindows = new Map(); // windowId -> window info
    }

    /**
     * 创建主窗口（工具站首页）
     * 不使用 BrowserView，直接加载首页内容
     */
    createMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.focus();
            return this.mainWindow;
        }

        const window = new BrowserWindow({
            width: DEFAULT_WINDOW_WIDTH,
            height: DEFAULT_WINDOW_HEIGHT,
            minWidth: MIN_WINDOW_WIDTH,
            minHeight: MIN_WINDOW_HEIGHT,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                preload: path.join(__dirname, '../preload.js'),
            },
            icon: path.join(__dirname, '../../../assets/icon.png'),
            show: false,
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        });

        this.mainWindow = window;

        // 恢复窗口位置和大小
        const savedBounds = this.store?.get('mainWindow.bounds');
        if (savedBounds) {
            window.setBounds(savedBounds);
        }

        // 保存窗口状态
        window.on('close', () => {
            if (!window.isDestroyed()) {
                const bounds = window.getBounds();
                this.store?.set('mainWindow.bounds', bounds);
            }
        });

        // 窗口关闭时清理引用
        window.on('closed', () => {
            this.mainWindow = null;
        });

        // 加载工具站首页
        this.loadMainWindowContent(window);

        // 窗口准备好时显示
        window.once('ready-to-show', () => {
            console.log('主窗口准备好，显示窗口');
            window.show();

            // 开发模式下打开开发者工具
            if (process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) {
                window.webContents.openDevTools({ mode: 'detach' });
            }
        });

        // 处理外部链接
        window.webContents.setWindowOpenHandler(({ url }) => {
            require('electron').shell.openExternal(url);
            return { action: 'deny' };
        });

        // 阻止导航到外部网站
        window.webContents.on('will-navigate', (event, navigationUrl) => {
            try {
                const parsedUrl = new URL(navigationUrl);
                const isLocalhost = parsedUrl.origin === 'http://localhost:3000';
                const isFile = parsedUrl.protocol === 'file:';

                if (!isLocalhost && !isFile) {
                    event.preventDefault();
                    require('electron').shell.openExternal(navigationUrl);
                }
            } catch (e) {
                event.preventDefault();
            }
        });

        console.log('主窗口已创建');
        return window;
    }

    /**
     * 加载主窗口内容
     */
    async loadMainWindowContent(window) {
        try {
            // 尝试加载代理服务器的首页
            await window.loadURL('http://localhost:3000/tools-home.html');
            console.log('主窗口已加载代理服务器首页');
        } catch (error) {
            console.warn('无法加载代理服务器首页，使用本地文件:', error.message);
            try {
                // 回退到本地文件
                const localPath = path.join(__dirname, '../../renderer/tools-home.html');
                await window.loadFile(localPath);
                console.log('主窗口已加载本地首页文件');
            } catch (fileError) {
                console.error('加载本地首页文件也失败:', fileError);
            }
        }
    }

    /**
     * 创建工具窗口（支持多标签和独立会话）
     * @param {Object} options - 窗口选项
     * @param {string} options.title - 窗口标题
     * @param {string} options.initialTab - 初始标签 URL
     * @param {string} options.initialTabTitle - 初始标签标题
     * @param {string} options.initialTabIcon - 初始标签图标
     * @param {number} options.width - 窗口宽度
     * @param {number} options.height - 窗口高度
     * @returns {BrowserWindow} 创建的工具窗口
     */
    createToolWindow(options = {}) {
        const {
            title = '精灵蜂工作台',
            initialTab = '/automation-dashboard.html',
            initialTabTitle = '精灵蜂仪表盘',
            initialTabIcon = 'fas fa-robot',
            width = DEFAULT_WINDOW_WIDTH,
            height = DEFAULT_WINDOW_HEIGHT
        } = options;

        const window = new BrowserWindow({
            width,
            height,
            minWidth: MIN_WINDOW_WIDTH,
            minHeight: MIN_WINDOW_HEIGHT,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                preload: path.join(__dirname, '../preload.js'),
            },
            icon: path.join(__dirname, '../../../assets/icon.png'),
            show: false,
            title: title,
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        });

        // 为这个窗口创建 TabManager
        const tabManager = tabManagerRegistry.createManager(window);
        
        // 创建 HeaderViewManager
        const headerViewManager = new HeaderViewManager(window, tabManager);

        // 存储窗口信息
        const windowInfo = {
            window,
            tabManager,
            headerViewManager,
            type: 'tool',
            title,
            createdAt: new Date()
        };
        this.toolWindows.set(window.id, windowInfo);

        // 恢复窗口状态
        const savedBounds = this.store?.get(`toolWindow.${window.id}.bounds`);
        if (savedBounds) {
            window.setBounds(savedBounds);
        }

        // 保存窗口状态
        window.on('close', () => {
            if (!window.isDestroyed()) {
                const bounds = window.getBounds();
                this.store?.set(`toolWindow.${window.id}.bounds`, bounds);
            }
        });

        // 窗口关闭时清理
        window.on('closed', () => {
            // 清理 HeaderViewManager
            const info = this.toolWindows.get(window.id);
            if (info?.headerViewManager) {
                info.headerViewManager.destroy();
            }
            
            this.toolWindows.delete(window.id);
            console.log(`工具窗口 ${window.id} 已关闭并清理`);
        });

        // 监听窗口大小变化，调整标题栏和标签视图
        window.on('resize', () => {
            if (headerViewManager) {
                headerViewManager.handleWindowResize();
            }
            if (tabManager) {
                tabManager.handleWindowResize();
            }
        });

        // 创建初始标签（先尝试代理服务器，失败则使用本地文件）
        this.createInitialTabWithFallback(tabManager, {
            proxyUrl: `http://localhost:3000${initialTab}?header=1`,
            localPath: path.join(__dirname, `../../renderer${initialTab.replace('/', '')}`),
            title: initialTabTitle,
            icon: initialTabIcon,
            isPersistent: false
        });

        // 窗口准备好时显示
        window.once('ready-to-show', () => {
            console.log(`工具窗口 ${window.id} 准备好，显示窗口`);
            window.show();
            
            // 发送初始标签状态到标题栏
            if (headerViewManager) {
                headerViewManager.sendInitialState();
            }
            
            // 开发模式下打开 DevTools
            if (process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) {
                // 延迟一下再打开DevTools，确保标签加载完成
                setTimeout(() => {
                    const activeTab = tabManager.getActiveTab();
                    if (activeTab) {
                        activeTab.view.webContents.openDevTools({ mode: 'detach' });
                    }
                }, 1000);
            }
        });
        
        // 如果ready-to-show没有及时触发，强制显示窗口
        setTimeout(() => {
            if (!window.isVisible() && !window.isDestroyed()) {
                console.log(`强制显示工具窗口 ${window.id}`);
                window.show();
            }
        }, 3000);

        console.log(`工具窗口 ${window.id} 已创建: ${title}`);
        return window;
    }

    /**
     * 为工具窗口创建初始标签（带回退机制）
     */
    async createInitialTabWithFallback(tabManager, options) {
        const { proxyUrl, localPath, title, icon, isPersistent } = options;
        
        try {
            console.log('正在创建初始标签:', { proxyUrl, localPath, title });
            
            // 先尝试使用代理URL
            const tab = tabManager.createTab({
                url: proxyUrl,
                title: title,
                icon: icon,
                isPersistent: isPersistent
            });
            console.log('标签创建成功:', tab.id);
            
            // 监听加载失败，如果代理服务器不可用，则回退到本地文件
            let fallbackTriggered = false;
            tab.view.webContents.on('did-fail-load', async (event, errorCode, errorDescription, validatedURL) => {
                console.error(`标签 ${tab.id} 加载失败:`, errorCode, errorDescription, validatedURL);
                
                if (!fallbackTriggered && validatedURL === proxyUrl) {
                    fallbackTriggered = true;
                    console.log('尝试回退到本地文件:', localPath);
                    
                    // 检查本地文件是否存在
                    const fs = require('fs');
                    if (fs.existsSync(localPath)) {
                        try {
                            // 使用 query 参数传递 header=1
                            await tab.view.webContents.loadFile(localPath, {
                                query: { header: '1' }
                            });
                            console.log('本地文件加载成功（包含 header 参数）');
                        } catch (fileError) {
                            console.error('本地文件加载也失败:', fileError);
                        }
                    } else {
                        console.error('本地文件不存在:', localPath);
                    }
                }
            });
            
            // 设置为活动标签
            const activeTab = tabManager.setActiveTab(tab.id);
            console.log('活动标签已设置:', activeTab.id);
            
            // 监听加载成功
            tab.view.webContents.once('did-finish-load', () => {
                console.log(`标签 ${tab.id} 加载完成`);
            });
            
            console.log(`初始标签已创建: ${title}`);
        } catch (error) {
            console.error('创建初始标签失败:', error);
            throw error;
        }
    }

    /**
     * 获取主窗口
     */
    getMainWindow() {
        return this.mainWindow;
    }

    /**
     * 获取所有工具窗口
     */
    getToolWindows() {
        return Array.from(this.toolWindows.values());
    }

    /**
     * 获取指定的工具窗口
     */
    getToolWindow(windowId) {
        return this.toolWindows.get(windowId);
    }

    /**
     * 关闭所有窗口
     */
    closeAllWindows() {
        // 关闭工具窗口
        this.toolWindows.forEach(({ window }) => {
            if (!window.isDestroyed()) {
                window.close();
            }
        });

        // 关闭主窗口
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.close();
        }
    }

    /**
     * 调试信息
     */
    getDebugInfo() {
        return {
            mainWindow: {
                exists: !!this.mainWindow,
                destroyed: this.mainWindow?.isDestroyed() ?? true
            },
            toolWindows: Array.from(this.toolWindows.entries()).map(([id, info]) => ({
                id,
                title: info.title,
                destroyed: info.window.isDestroyed(),
                tabCount: info.tabManager.getAllTabs().length
            }))
        };
    }
}

module.exports = WindowFactory;