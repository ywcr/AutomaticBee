/**
 * HeaderViewManager - 窗口级标题栏视图管理器
 * 负责创建和管理每个工具窗口的标题栏 BrowserView，处理标签状态同步与用户交互
 */

const { BrowserView } = require('electron');
const path = require('path');
const fs = require('fs');
const { HEADER_HEIGHT } = require('../config/LayoutConstants');

class HeaderViewManager {
    constructor(window, tabManager) {
        this.window = window;
        this.tabManager = tabManager;
        this.headerView = null;
        this.isDestroyed = false;
        
        console.log(`创建 HeaderViewManager for window ${window.id}`);
        
        // 初始化标题栏视图
        this.init();
    }
    
    /**
     * 初始化标题栏视图
     */
    async init() {
        try {
            // 创建标题栏 BrowserView
            await this.createHeaderView();
            
            // 绑定标签事件监听
            this.bindTabEvents();
            
            console.log(`HeaderViewManager 初始化完成 for window ${this.window.id}`);
        } catch (error) {
            console.error('HeaderViewManager 初始化失败:', error);
            throw error;
        }
    }
    
    /**
     * 创建标题栏 BrowserView
     */
    async createHeaderView() {
        try {
            // 创建 BrowserView
            this.headerView = new BrowserView({
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    enableRemoteModule: false,
                    webSecurity: true,
                    allowRunningInsecureContent: false,
                    preload: path.join(__dirname, '../preload.js')
                }
            });
            
            // 添加到窗口（在内容视图之前）
            this.window.addBrowserView(this.headerView);
            
            // 设置初始位置和大小
            this.setBounds();
            
            // 加载标题栏页面
            await this.loadHeaderPage();
            
            console.log(`HeaderView 已创建 for window ${this.window.id}`);
        } catch (error) {
            console.error('创建 HeaderView 失败:', error);
            throw error;
        }
    }
    
    /**
     * 设置标题栏 BrowserView 的位置和大小
     */
    setBounds() {
        if (!this.headerView || this.isDestroyed) return;
        
        try {
            const bounds = this.window.getContentBounds();
            this.headerView.setBounds({
                x: 0,
                y: 0,
                width: bounds.width,
                height: HEADER_HEIGHT
            });
        } catch (error) {
            console.error('设置 HeaderView bounds 失败:', error);
        }
    }
    
    /**
     * 加载标题栏页面（代理服务器 -> 本地文件回退）
     */
    async loadHeaderPage() {
        const proxyUrl = 'http://localhost:3000/header-tabs.html';
        const localPath = path.join(__dirname, '../../renderer/header-tabs.html');
        
        try {
            // 首先尝试代理服务器
            await this.headerView.webContents.loadURL(proxyUrl);
            console.log('HeaderView 已加载代理页面');
        } catch (proxyError) {
            console.warn('代理服务器加载失败，尝试本地文件:', proxyError.message);
            
            try {
                // 检查本地文件是否存在
                if (fs.existsSync(localPath)) {
                    await this.headerView.webContents.loadFile(localPath);
                    console.log('HeaderView 已加载本地文件');
                } else {
                    console.error('本地 header-tabs.html 文件不存在:', localPath);
                    throw new Error('Header page not found');
                }
            } catch (fileError) {
                console.error('本地文件加载失败:', fileError);
                throw fileError;
            }
        }
    }
    
    /**
     * 绑定标签事件监听，将标签状态变化同步到标题栏
     */
    bindTabEvents() {
        if (!this.tabManager) return;
        
        // 监听各种标签事件
        const events = [
            'tabCreated',
            'tabClosed', 
            'tabUpdated',
            'tabActivated',
            'tabTitleChanged',
            'tabAccountChanged'
        ];
        
        events.forEach(eventName => {
            this.tabManager.on(eventName, () => {
                this.sendTabsState();
            });
        });
        
        console.log('已绑定标签事件监听');
    }
    
    /**
     * 发送标签状态到标题栏渲染器
     */
    sendTabsState() {
        if (!this.headerView || this.isDestroyed) return;
        
        try {
            // 获取当前标签状态
            const tabs = this.tabManager.getAllTabs().map(tab => ({
                id: tab.id,
                title: tab.title,
                customTitle: tab.customTitle,
                icon: tab.icon,
                url: tab.url,
                isPersistent: tab.isPersistent,
                account: tab.account,
                displayTitle: this.tabManager.getTabDisplayTitle(tab)
            }));
            
            const activeTabId = this.tabManager.getActiveTabId();
            
            // 发送状态到渲染器
            this.headerView.webContents.send('tabs:state', {
                tabs,
                activeTabId
            });
            
        } catch (error) {
            console.error('发送标签状态失败:', error);
        }
    }
    
    /**
     * 初始化时发送一次完整状态
     */
    sendInitialState() {
        // 延迟发送，确保渲染器已准备好
        setTimeout(() => {
            this.sendTabsState();
        }, 500);
    }
    
    /**
     * 处理窗口大小变化
     */
    handleWindowResize() {
        this.setBounds();
    }
    
    /**
     * 获取标题栏高度
     */
    static getHeaderHeight() {
        return HEADER_HEIGHT;
    }
    
    /**
     * 获取标题栏视图引用
     */
    getHeaderView() {
        return this.headerView;
    }
    
    /**
     * 销毁标题栏视图
     */
    destroy() {
        if (this.isDestroyed) return;
        
        console.log(`销毁 HeaderViewManager for window ${this.window?.id}`);
        
        try {
            // 移除事件监听
            if (this.tabManager) {
                this.tabManager.removeAllListeners('tabCreated');
                this.tabManager.removeAllListeners('tabClosed');
                this.tabManager.removeAllListeners('tabUpdated');
                this.tabManager.removeAllListeners('tabActivated');
                this.tabManager.removeAllListeners('tabTitleChanged');
                this.tabManager.removeAllListeners('tabAccountChanged');
            }
            
            // 销毁 BrowserView
            if (this.headerView && this.window && !this.window.isDestroyed()) {
                this.window.removeBrowserView(this.headerView);
                this.headerView.webContents.destroy();
            }
            
        } catch (error) {
            console.error('销毁 HeaderViewManager 时出错:', error);
        } finally {
            this.headerView = null;
            this.tabManager = null;
            this.window = null;
            this.isDestroyed = true;
        }
    }
}

module.exports = { HeaderViewManager };
