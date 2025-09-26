/**
 * WindowIPCHandler - 窗口相关 IPC 处理器
 * 负责处理窗口创建、管理等操作
 */

const { ipcMain } = require('electron');

class WindowIPCHandler {
    constructor(windowFactory, tabManagerRegistry) {
        this.windowFactory = windowFactory;
        this.tabManagerRegistry = tabManagerRegistry;
        this.registerHandlers();
    }

    /**
     * 注册所有窗口相关的 IPC 处理器
     */
    registerHandlers() {
        // 创建工具窗口
        ipcMain.handle('window-create-tool', this.handleCreateToolWindow.bind(this));
        
        // 获取窗口列表
        ipcMain.handle('window-get-list', this.handleGetWindowList.bind(this));
        
        // 聚焦窗口
        ipcMain.handle('window-focus', this.handleFocusWindow.bind(this));
        
        // 获取调试信息
        ipcMain.handle('window-get-debug-info', this.handleGetDebugInfo.bind(this));

        console.log('窗口相关 IPC 处理器已注册');
    }

    /**
     * 创建工具窗口
     */
    async handleCreateToolWindow(event, options = {}) {
        try {
            const {
                title = '精灵蜂工作台',
                initialTab = '/automation-dashboard.html',
                initialTabTitle = '精灵蜂仪表盘',
                initialTabIcon = 'fas fa-robot',
                width = 1400,
                height = 900
            } = options;

            console.log('创建工具窗口请求:', { title, initialTab, initialTabTitle });

            const window = this.windowFactory.createToolWindow({
                title,
                initialTab,
                initialTabTitle,
                initialTabIcon,
                width,
                height
            });

            return {
                success: true,
                windowId: window.id,
                title: window.getTitle(),
                message: '工具窗口已创建'
            };
        } catch (error) {
            console.error('创建工具窗口失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取窗口列表
     */
    async handleGetWindowList(event) {
        try {
            const mainWindow = this.windowFactory.getMainWindow();
            const toolWindows = this.windowFactory.getToolWindows();

            const windowList = [];

            // 主窗口信息
            if (mainWindow && !mainWindow.isDestroyed()) {
                windowList.push({
                    id: mainWindow.id,
                    type: 'main',
                    title: mainWindow.getTitle(),
                    bounds: mainWindow.getBounds(),
                    isVisible: mainWindow.isVisible(),
                    isFocused: mainWindow.isFocused()
                });
            }

            // 工具窗口信息
            toolWindows.forEach(({ window, type, title }) => {
                if (!window.isDestroyed()) {
                    windowList.push({
                        id: window.id,
                        type: type,
                        title: window.getTitle(),
                        bounds: window.getBounds(),
                        isVisible: window.isVisible(),
                        isFocused: window.isFocused(),
                        originalTitle: title
                    });
                }
            });

            return {
                success: true,
                windows: windowList
            };
        } catch (error) {
            console.error('获取窗口列表失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 聚焦指定窗口
     */
    async handleFocusWindow(event, windowId) {
        try {
            const mainWindow = this.windowFactory.getMainWindow();
            const toolWindow = this.windowFactory.getToolWindow(windowId);

            let targetWindow = null;
            
            if (mainWindow && mainWindow.id === windowId) {
                targetWindow = mainWindow;
            } else if (toolWindow) {
                targetWindow = toolWindow.window;
            }

            if (!targetWindow || targetWindow.isDestroyed()) {
                return {
                    success: false,
                    error: '窗口不存在或已被销毁'
                };
            }

            // 显示并聚焦窗口
            if (targetWindow.isMinimized()) {
                targetWindow.restore();
            }
            targetWindow.show();
            targetWindow.focus();

            return {
                success: true,
                message: '窗口已聚焦'
            };
        } catch (error) {
            console.error('聚焦窗口失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取调试信息
     */
    async handleGetDebugInfo(event) {
        try {
            const windowDebugInfo = this.windowFactory.getDebugInfo();
            const tabDebugInfo = this.tabManagerRegistry.getDebugInfo();

            return {
                success: true,
                debug: {
                    windows: windowDebugInfo,
                    tabs: tabDebugInfo,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('获取调试信息失败:', error);
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
            'window-create-tool',
            'window-get-list',
            'window-focus',
            'window-get-debug-info'
        ];

        channels.forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('窗口相关 IPC 处理器已清理');
    }
}

module.exports = { WindowIPCHandler };