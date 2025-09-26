/**
 * TabManagerRegistry - TabManager 实例注册与管理
 * 负责为每个窗口维护独立的 TabManager 实例，确保窗口间标签管理互不干扰
 */

const TabManager = require('./TabManager');

class TabManagerRegistry {
    constructor() {
        // windowId -> TabManager 实例的映射
        this.managers = new Map();
    }

    /**
     * 为窗口创建并注册 TabManager
     * @param {BrowserWindow} window - Electron 窗口实例
     * @returns {TabManager} 创建的 TabManager 实例
     */
    createManager(window) {
        const windowId = window.id;
        
        // 如果已存在，先清理旧实例
        if (this.managers.has(windowId)) {
            this.destroyManager(windowId);
        }

        // 创建新的 TabManager 实例
        const tabManager = new TabManager(window);
        this.managers.set(windowId, tabManager);

        // 监听窗口关闭事件，自动清理
        window.on('closed', () => {
            this.destroyManager(windowId);
        });

        console.log(`TabManager 已为窗口 ${windowId} 创建`);
        return tabManager;
    }

    /**
     * 获取指定窗口的 TabManager
     * @param {number} windowId - 窗口 ID
     * @returns {TabManager|null} TabManager 实例或 null
     */
    getManager(windowId) {
        return this.managers.get(windowId) || null;
    }

    /**
     * 通过 webContents 获取对应的 TabManager
     * @param {WebContents} webContents - 发起 IPC 请求的 webContents
     * @returns {TabManager|null} TabManager 实例或 null
     */
    getManagerByWebContents(webContents) {
        const window = require('electron').BrowserWindow.fromWebContents(webContents);
        if (!window) {
            return null;
        }
        return this.getManager(window.id);
    }

    /**
     * 销毁指定窗口的 TabManager
     * @param {number} windowId - 窗口 ID
     * @returns {boolean} 是否成功销毁
     */
    destroyManager(windowId) {
        const tabManager = this.managers.get(windowId);
        if (!tabManager) {
            return false;
        }

        try {
            // 销毁 TabManager 及其管理的所有标签
            tabManager.destroy();
            this.managers.delete(windowId);
            console.log(`TabManager 已为窗口 ${windowId} 销毁`);
            return true;
        } catch (error) {
            console.error(`销毁窗口 ${windowId} 的 TabManager 时出错:`, error);
            return false;
        }
    }

    /**
     * 获取所有活动的 TabManager
     * @returns {Map<number, TabManager>} 所有活动的 TabManager 实例
     */
    getAllManagers() {
        return new Map(this.managers);
    }

    /**
     * 获取活动窗口数量
     * @returns {number} 活动窗口数量
     */
    getActiveWindowCount() {
        return this.managers.size;
    }

    /**
     * 清理所有 TabManager 实例
     * 通常在应用退出时调用
     */
    destroyAll() {
        console.log(`正在清理所有 TabManager 实例，共 ${this.managers.size} 个`);
        
        for (const [windowId, tabManager] of this.managers) {
            try {
                tabManager.destroy();
            } catch (error) {
                console.error(`清理窗口 ${windowId} 的 TabManager 时出错:`, error);
            }
        }
        
        this.managers.clear();
        console.log('所有 TabManager 实例已清理完成');
    }

    /**
     * 调试信息 - 获取所有窗口的标签统计
     * @returns {Object} 调试信息
     */
    getDebugInfo() {
        const info = {
            totalWindows: this.managers.size,
            windows: {}
        };

        for (const [windowId, tabManager] of this.managers) {
            const tabs = tabManager.getAllTabs();
            info.windows[windowId] = {
                tabCount: tabs.length,
                activeTabId: tabManager.activeTabId,
                tabs: tabs.map(tab => ({
                    id: tab.id,
                    title: tab.title,
                    url: tab.url,
                    account: tab.account?.username || null
                }))
            };
        }

        return info;
    }
}

// 单例实例
const tabManagerRegistry = new TabManagerRegistry();

module.exports = { TabManagerRegistry, tabManagerRegistry };