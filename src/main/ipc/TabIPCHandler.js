/**
 * TabIPCHandler - 标签相关 IPC 处理器
 * 负责将标签相关的 IPC 请求路由到对应窗口的 TabManager
 */

const { ipcMain, BrowserWindow } = require('electron');
const { tabManagerRegistry } = require('../managers/TabManagerRegistry');

class TabIPCHandler {
    constructor() {
        this.registerHandlers();
    }

    /**
     * 注册所有标签相关的 IPC 处理器
     */
    registerHandlers() {
        // 创建新标签
        ipcMain.handle('tab-create', this.handleCreateTab.bind(this));
        
        // 设置活跃标签
        ipcMain.handle('tab-set-active', this.handleSetActiveTab.bind(this));
        
        // 关闭标签
        ipcMain.handle('tab-close', this.handleCloseTab.bind(this));
        
        // 获取所有标签
        ipcMain.handle('tab-get-all', this.handleGetAllTabs.bind(this));
        
        // 获取指定标签
        ipcMain.handle('tab-get', this.handleGetTab.bind(this));
        
        // 获取活跃标签
        ipcMain.handle('tab-get-active', this.handleGetActiveTab.bind(this));
        
        // 设置标签账号
        ipcMain.handle('tab-set-account', this.handleSetTabAccount.bind(this));
        
        // 设置标签自定义标题
        ipcMain.handle('tab-set-title', this.handleSetTabTitle.bind(this));
        
        // 清除标签自定义标题
        ipcMain.handle('tab-clear-custom-title', this.handleClearCustomTitle.bind(this));

        console.log('标签相关 IPC 处理器已注册');
    }

    /**
     * 根据发送者获取对应的 TabManager
     * @param {WebContents} sender - IPC 发送者
     * @returns {Object} { tabManager, window, error }
     */
    getTabManagerFromSender(sender) {
        const window = BrowserWindow.fromWebContents(sender);
        if (!window) {
            return { 
                tabManager: null, 
                window: null, 
                error: '无法找到发送请求的窗口' 
            };
        }

        const tabManager = tabManagerRegistry.getManager(window.id);
        if (!tabManager) {
            return { 
                tabManager: null, 
                window, 
                error: `窗口 ${window.id} 没有关联的 TabManager` 
            };
        }

        return { tabManager, window, error: null };
    }

    /**
     * 创建新标签
     */
    async handleCreateTab(event, options) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const tab = tabManager.createTab(options);
            return {
                success: true,
                tabId: tab.id,
                tab: {
                    id: tab.id,
                    title: tab.title,
                    customTitle: tab.customTitle,
                    icon: tab.icon,
                    url: tab.url,
                    isPersistent: tab.isPersistent,
                    account: tab.account
                }
            };
        } catch (error) {
            console.error('创建标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 设置活跃标签
     */
    async handleSetActiveTab(event, tabId) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const tab = tabManager.setActiveTab(tabId);
            return {
                success: true,
                tab: {
                    id: tab.id,
                    title: tab.title,
                    customTitle: tab.customTitle,
                    icon: tab.icon,
                    url: tab.url,
                    account: tab.account
                }
            };
        } catch (error) {
            console.error('设置活跃标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 关闭标签
     */
    async handleCloseTab(event, tabId) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const success = tabManager.closeTab(tabId);
            return {
                success: success,
                message: success ? '标签已关闭' : '无法关闭该标签'
            };
        } catch (error) {
            console.error('关闭标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取所有标签
     */
    async handleGetAllTabs(event) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const tabs = tabManager.getAllTabs().map(tab => ({
                id: tab.id,
                title: tab.title,
                customTitle: tab.customTitle,
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
            console.error('获取所有标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取指定标签
     */
    async handleGetTab(event, tabId) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
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
                    customTitle: tab.customTitle,
                    icon: tab.icon,
                    url: tab.url,
                    isPersistent: tab.isPersistent,
                    account: tab.account
                }
            };
        } catch (error) {
            console.error('获取标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取活跃标签
     */
    async handleGetActiveTab(event) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
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
                    customTitle: tab.customTitle,
                    icon: tab.icon,
                    url: tab.url,
                    account: tab.account
                }
            };
        } catch (error) {
            console.error('获取活跃标签失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 设置标签账号
     */
    async handleSetTabAccount(event, tabId, accountInfo) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const success = tabManager.setTabAccount(tabId, accountInfo);
            return {
                success: success,
                message: success ? '账号设置成功' : '设置账号失败'
            };
        } catch (error) {
            console.error('设置标签账号失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 设置标签自定义标题
     */
    async handleSetTabTitle(event, tabId, customTitle) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const success = tabManager.setTabCustomTitle(tabId, customTitle);
            return {
                success: success,
                message: success ? '标题设置成功' : '设置标题失败'
            };
        } catch (error) {
            console.error('设置标签标题失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 清除标签自定义标题
     */
    async handleClearCustomTitle(event, tabId) {
        try {
            const { tabManager, error } = this.getTabManagerFromSender(event.sender);
            if (error) {
                return { success: false, error };
            }

            const success = tabManager.clearTabCustomTitle(tabId);
            return {
                success: success,
                message: success ? '自定义标题已清除' : '清除自定义标题失败'
            };
        } catch (error) {
            console.error('清除标签自定义标题失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 清理 IPC 处理器
     */
    cleanup() {
        const channels = [
            'tab-create',
            'tab-set-active', 
            'tab-close',
            'tab-get-all',
            'tab-get',
            'tab-get-active',
            'tab-set-account',
            'tab-set-title',
            'tab-clear-custom-title'
        ];

        channels.forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('标签相关 IPC 处理器已清理');
    }
}

// 单例实例
const tabIPCHandler = new TabIPCHandler();

module.exports = { TabIPCHandler, tabIPCHandler };