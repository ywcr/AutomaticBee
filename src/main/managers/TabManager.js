/**
 * TabManager - 多标签页面管理器
 * 负责管理多个独立的BrowserView实例，每个都有自己的session分区
 */

const { BrowserView, session } = require('electron');
const path = require('path');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');
const { HEADER_HEIGHT } = require('../config/LayoutConstants');

class TabManager extends EventEmitter {
    constructor(mainWindow) {
        super();
        this.mainWindow = mainWindow;
        this.tabs = new Map(); // 存储所有标签
        this.activeTabId = null;
        this.tabCounter = 0;
        
        // 不再自动初始化主标签，由外部决定何时创建标签
        // this.initMainTab();
    }

    /**
     * 初始化主标签 - 工具站首页
     */
    initMainTab() {
        const mainTab = this.createTab({
            url: 'http://localhost:3000/tools-home.html',
            title: '工具集合站',
            icon: 'fas fa-tools',
            isPersistent: true // 主标签不能关闭
        });
        
        this.setActiveTab(mainTab.id);
        return mainTab;
    }

    /**
     * 创建新标签
     * @param {Object} options - 标签选项
     * @param {string} options.url - 目标URL
     * @param {string} options.title - 标签标题
     * @param {string} options.icon - 图标类名
     * @param {boolean} options.isPersistent - 是否持久化（不能关闭）
     * @param {string} options.sessionId - 指定session ID（用于账号隔离）
     */
    createTab(options = {}) {
        this.tabCounter++;
        const tabId = `tab_${this.tabCounter}_${uuidv4()}`;
        
        const {
            url = 'http://localhost:3000/',
            title = '新标签页',
            icon = 'fas fa-globe',
            isPersistent = false,
            sessionId = null
        } = options;

        // 创建独立的session分区
        const partitionId = sessionId || `jlf-tab-${tabId}`;
        const tabSession = session.fromPartition(`persist:${partitionId}`);
        
        // 配置session安全策略
        this.configureSessionSecurity(tabSession);

        // 创建BrowserView
        const view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                session: tabSession,
                preload: path.join(__dirname, '../preload.js')
            }
        });

        // 创建标签对象
        const tab = {
            id: tabId,
            view: view,
            session: tabSession,
            url: url,
            title: title,
            customTitle: null, // 用户自定义标题
            icon: icon,
            isPersistent: isPersistent,
            sessionId: partitionId,
            createdAt: new Date(),
            lastAccessed: new Date(),
            account: null // 存储登录账号信息
        };

        // 存储标签
        this.tabs.set(tabId, tab);

        // 设置导航限制
        this.setupNavigationRestrictions(view, tab);

        // 加载页面
        this.loadTabUrl(tab, url);

        // 触发事件
        this.emit('tabCreated', { tabId, tab });

        return tab;
    }

    /**
     * 配置session安全策略
     */
    configureSessionSecurity(tabSession) {
        // 放开网络拦截：不再在请求层做统一拦截/重写，外部资源走直连
        // 仅保留权限与下载等事件处理

        // 设置权限策略（保留剪贴板权限示例）
        tabSession.setPermissionRequestHandler((webContents, permission, callback) => {
            const allowedPermissions = ['clipboard-read', 'clipboard-write'];
            callback(allowedPermissions.includes(permission));
        });

        // 下载事件（可选）
        tabSession.on('will-download', (event, item, webContents) => {
            console.log('Download started:', item.getURL());
        });
    }

    /**
     * 设置导航限制
     */
    setupNavigationRestrictions(view, tab) {
        // 限制导航范围
        view.webContents.on('will-navigate', (event, navigationUrl) => {
            try {
                const parsedUrl = new URL(navigationUrl);
                const isLocalhost = parsedUrl.origin === 'http://localhost:3000';
                const isFile = parsedUrl.protocol === 'file:';

                if (!isLocalhost && !isFile) {
                    event.preventDefault();
                    // 外部链接在系统浏览器中打开
                    require('electron').shell.openExternal(navigationUrl);
                }
            } catch (e) {
                event.preventDefault();
            }
        });

        // 处理新窗口请求
        view.webContents.setWindowOpenHandler(({ url }) => {
            // 在系统浏览器中打开外部链接
            require('electron').shell.openExternal(url);
            return { action: 'deny' };
        });

        // 监听页面标题变化
        view.webContents.on('page-title-updated', (event, title) => {
            // 如果有自定义标题，则不更新标题，但仍然更新原始标题供清除自定义标题时使用
            if (tab.title !== title) {
                tab.title = title;
                tab.lastAccessed = new Date();
                
                // 只有在没有自定义标题时才发送更新事件
                if (!tab.customTitle) {
                    this.emit('tabUpdated', { tabId: tab.id, tab });
                }
            }
        });

        // 监听页面加载完成
        view.webContents.on('did-finish-load', () => {
            tab.lastAccessed = new Date();
            this.emit('tabLoaded', { tabId: tab.id, tab });
        });

        // 监听DOM准备就绪
        view.webContents.on('dom-ready', () => {
            this.emit('tabReady', { tabId: tab.id, tab });
        });
    }

    /**
     * 加载标签URL
     */
    async loadTabUrl(tab, url) {
        try {
            await tab.view.webContents.loadURL(url);
            tab.url = url;
        } catch (error) {
            console.error(`Failed to load URL for tab ${tab.id}:`, error);
            
            // 尝试加载本地备用页面
            const fallbackPath = path.join(__dirname, '../../renderer/tools-home.html');
            try {
                await tab.view.webContents.loadFile(fallbackPath);
                tab.url = `file://${fallbackPath}`;
            } catch (fallbackError) {
                console.error('Failed to load fallback page:', fallbackError);
                this.emit('tabError', { tabId: tab.id, error: fallbackError });
            }
        }
    }

    /**
     * 设置活动标签
     */
    setActiveTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            throw new Error(`Tab ${tabId} not found`);
        }

        // 隐藏当前活动标签
        if (this.activeTabId && this.activeTabId !== tabId) {
            const currentTab = this.tabs.get(this.activeTabId);
            if (currentTab) {
                this.mainWindow.removeBrowserView(currentTab.view);
            }
        }

        // 显示新的活动标签（使用 addBrowserView 支持多视图共存）
        this.mainWindow.addBrowserView(tab.view);
        
        // 获取窗口内容区域
        const bounds = this.mainWindow.getContentBounds();
        tab.view.setBounds({
            x: 0,
            y: HEADER_HEIGHT, // 为标题栏预留高度
            width: bounds.width,
            height: bounds.height - HEADER_HEIGHT
        });

        this.activeTabId = tabId;
        tab.lastAccessed = new Date();

        // 更新窗口标题
        this.updateWindowTitle();

        this.emit('tabActivated', { tabId, tab });
        return tab;
    }

    /**
     * 关闭标签
     */
    closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            throw new Error(`Tab ${tabId} not found`);
        }

        // 检查是否可以关闭
        if (tab.isPersistent) {
            console.warn(`Cannot close persistent tab: ${tabId}`);
            return false;
        }

        // 如果是当前活动标签，切换到其他标签
        if (this.activeTabId === tabId) {
            const otherTabs = Array.from(this.tabs.values()).filter(t => t.id !== tabId);
            if (otherTabs.length > 0) {
                this.setActiveTab(otherTabs[0].id);
            } else {
                this.activeTabId = null;
            }
        }

        // 清理BrowserView
        this.mainWindow.removeBrowserView(tab.view);
        tab.view.webContents.destroy();

        // 清理session（可选）
        if (!tab.isPersistent) {
            tab.session.clearStorageData();
        }

        // 从管理列表中移除
        this.tabs.delete(tabId);

        this.emit('tabClosed', { tabId, tab });
        return true;
    }

    /**
     * 获取所有标签
     */
    getAllTabs() {
        return Array.from(this.tabs.values());
    }

    /**
     * 获取标签信息
     */
    getTab(tabId) {
        return this.tabs.get(tabId);
    }

    /**
     * 获取活动标签
     */
    getActiveTab() {
        return this.activeTabId ? this.tabs.get(this.activeTabId) : null;
    }

    /**
     * 获取活动标签 ID
     */
    getActiveTabId() {
        return this.activeTabId;
    }

    /**
     * 设置标签自定义标题
     * @param {string} tabId - 标签ID
     * @param {string} customTitle - 自定义标题
     * @returns {boolean} - 是否设置成功
     */
    setTabCustomTitle(tabId, customTitle) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`尝试为不存在的标签 ${tabId} 设置自定义标题`);
            return false;
        }

        const oldCustomTitle = tab.customTitle;
        tab.customTitle = customTitle;
        tab.lastAccessed = new Date();
        
        console.log(`标签 ${tabId} 自定义标题已设置: ${oldCustomTitle || '(无)'} -> ${customTitle}`);
        
        // 如果这是当前活动标签，同时更新窗口标题
        if (this.activeTabId === tabId) {
            this.updateWindowTitle();
        }
        
        // 发送标签更新事件
        this.emit('tabUpdated', { tabId, tab });
        this.emit('tabTitleChanged', { tabId, customTitle, oldCustomTitle });
        
        return true;
    }

    /**
     * 清除标签自定义标题，恢复页面标题
     * @param {string} tabId - 标签ID
     * @returns {boolean} - 是否清除成功
     */
    clearTabCustomTitle(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`尝试为不存在的标签 ${tabId} 清除自定义标题`);
            return false;
        }

        const oldCustomTitle = tab.customTitle;
        tab.customTitle = null;
        tab.lastAccessed = new Date();
        
        console.log(`标签 ${tabId} 自定义标题已清除: ${oldCustomTitle} -> 使用页面标题`);
        
        // 如果这是当前活动标签，同时更新窗口标题
        if (this.activeTabId === tabId) {
            this.updateWindowTitle();
        }
        
        // 发送标签更新事件
        this.emit('tabUpdated', { tabId, tab });
        this.emit('tabTitleChanged', { tabId, customTitle: null, oldCustomTitle });
        
        return true;
    }

    /**
     * 获取标签显示标题（优先使用自定义标题）
     * @param {Object} tab - 标签对象
     * @returns {string} - 显示标题
     */
    getTabDisplayTitle(tab) {
        return tab.customTitle || tab.title || '新标签页';
    }

    /**
     * 为标签设置账号信息
     * 登录成功后会将标签标题更新为用户名
     */
    setTabAccount(tabId, accountInfo) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            console.warn(`尝试为不存在的标签 ${tabId} 设置账号信息`);
            return false;
        }

        // 设置账号信息
        tab.account = accountInfo;
        
        // 如果有用户名，更新标签标题
        if (accountInfo && accountInfo.username) {
            const oldTitle = tab.title;
            tab.title = accountInfo.username;
            console.log(`标签 ${tabId} 标题已更新: ${oldTitle} -> ${tab.title}`);
            
            // 如果这是当前活动标签，同时更新窗口标题
            if (this.activeTabId === tabId) {
                this.updateWindowTitle();
            }
        }
        
        // 发送标签更新事件
        this.emit('tabUpdated', { tabId, tab });
        this.emit('tabAccountChanged', { tabId, account: accountInfo });
        
        return true;
    }

    /**
     * 处理窗口大小改变
     */
    handleWindowResize() {
        if (this.activeTabId) {
            const tab = this.tabs.get(this.activeTabId);
            if (tab) {
                const bounds = this.mainWindow.getContentBounds();
                tab.view.setBounds({
                    x: 0,
                    y: HEADER_HEIGHT,
                    width: bounds.width,
                    height: bounds.height - HEADER_HEIGHT
                });
            }
        }
    }

    /**
     * 更新主窗口标题（基于当前活动标签）
     */
    updateWindowTitle() {
        if (!this.activeTabId) {
            return;
        }
        
        const activeTab = this.tabs.get(this.activeTabId);
        if (!activeTab) {
            return;
        }
        
        let windowTitle = '精灵蜂工作台';
        
        // 优先使用自定义标题，其次是账号信息，最后是页面标题
        if (activeTab.customTitle) {
            windowTitle += ` - ${activeTab.customTitle}`;
        } else if (activeTab.account?.username) {
            windowTitle += ` - ${activeTab.account.username}`;
        } else if (activeTab.title && activeTab.title !== '新标签页') {
            windowTitle += ` - ${activeTab.title}`;
        }
        
        try {
            this.mainWindow.setTitle(windowTitle);
        } catch (error) {
            console.error('更新窗口标题失败:', error);
        }
    }

    /**
     * 销毁所有标签
     */
    destroy() {
        console.log(`正在销毁 TabManager，共 ${this.tabs.size} 个标签`);
        
        this.tabs.forEach(tab => {
            try {
                this.mainWindow.removeBrowserView(tab.view);
                tab.view.webContents.destroy();
                if (!tab.isPersistent) {
                    tab.session.clearStorageData();
                }
            } catch (error) {
                console.error(`Error destroying tab ${tab.id}:`, error);
            }
        });
        
        this.tabs.clear();
        this.activeTabId = null;
        this.removeAllListeners();
        console.log('TabManager 已销毁完成');
    }
}

module.exports = TabManager;