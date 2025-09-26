/**
 * 标题栏标签管理脚本
 * 负责标签栏的UI渲染和用户交互
 */

class HeaderTabsManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.contextMenuTabId = null;
        this.editingTabId = null;
        
        this.init();
    }
    
    async init() {
        try {
            // 检查是否在 Electron 环境中
            if (!window.electronAPI?.tabManager) {
                this.showError('Electron API 不可用');
                return;
            }
            
            console.log('初始化标题栏标签管理器');
            
            // 绑定事件
            this.bindEvents();
            
            // 订阅标签状态变化
            this.subscribeToTabsState();
            
            // 加载初始标签状态
            await this.loadInitialState();
            
        } catch (error) {
            console.error('标题栏标签管理器初始化失败:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }
    
    bindEvents() {
        // 新建标签按钮
        const newTabBtn = document.getElementById('new-tab-btn');
        if (newTabBtn) {
            newTabBtn.addEventListener('click', () => this.createNewTab());
        }
        
        // 全局点击事件（关闭上下文菜单）
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });
        
        // 上下文菜单事件
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.addEventListener('click', (e) => {
                const action = e.target.closest('.context-menu-item')?.dataset.action;
                if (action && this.contextMenuTabId) {
                    this.handleContextMenuAction(action, this.contextMenuTabId);
                }
                this.hideContextMenu();
            });
        }
    }
    
    subscribeToTabsState() {
        // 订阅标签状态变化
        if (window.electronAPI?.onTabsState) {
            window.electronAPI.onTabsState((state) => {
                console.log('收到标签状态更新:', state);
                this.updateTabsState(state);
            });
        }
    }
    
    async loadInitialState() {
        try {
            // 获取所有标签
            const tabsResult = await window.electronAPI.tabManager.getAllTabs();
            const activeResult = await window.electronAPI.tabManager.getActiveTab();
            
            if (tabsResult?.success) {
                this.tabs = tabsResult.tabs || [];
                this.activeTabId = activeResult?.tab?.id || null;
                
                console.log('加载初始标签状态:', { tabs: this.tabs, activeTabId: this.activeTabId });
                this.renderTabs();
            } else {
                console.error('加载标签失败:', tabsResult?.error);
                this.showError('加载标签失败');
            }
        } catch (error) {
            console.error('加载初始状态失败:', error);
            this.showError('加载失败: ' + error.message);
        }
    }
    
    updateTabsState(state) {
        if (!state) return;
        
        this.tabs = state.tabs || [];
        this.activeTabId = state.activeTabId || null;
        
        this.renderTabs();
    }
    
    renderTabs() {
        const container = document.getElementById('tabs-container');
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        if (this.tabs.length === 0) {
            container.innerHTML = '<div class="loading">暂无标签</div>';
            return;
        }
        
        // 渲染标签
        this.tabs.forEach(tab => {
            const tabElement = this.createTabElement(tab);
            container.appendChild(tabElement);
        });
    }
    
    createTabElement(tab) {
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        tabItem.dataset.tabId = tab.id;
        
        // 设置活动状态
        if (tab.id === this.activeTabId) {
            tabItem.classList.add('active');
        }
        
        // 图标
        const icon = document.createElement('i');
        icon.className = `tab-icon ${tab.icon || 'fas fa-globe'}`;
        tabItem.appendChild(icon);
        
        // 标题
        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = tab.displayTitle || tab.title || '新标签页';
        title.title = title.textContent; // 添加 tooltip
        tabItem.appendChild(title);
        
        // 关闭按钮（非持久化标签才显示）
        if (!tab.isPersistent) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = '×';
            closeBtn.title = '关闭标签';
            
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            });
            
            tabItem.appendChild(closeBtn);
        }
        
        // 标签点击事件
        tabItem.addEventListener('click', () => {
            this.switchToTab(tab.id);
        });
        
        // 双击重命名事件
        title.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.startRenaming(tab.id);
        });
        
        // 右键菜单事件
        tabItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, tab.id);
        });
        
        return tabItem;
    }
    
    async createNewTab() {
        try {
            console.log('创建新标签');
            
            const result = await window.electronAPI.tabManager.createTab({
                url: 'http://localhost:3000/login.html?returnTo=automation-dashboard.html',
                title: '登录',
                icon: 'fas fa-sign-in-alt'
            });
            
            if (result?.success) {
                console.log('新标签已创建:', result.tabId);
                // 状态会通过 onTabsState 事件自动更新
            } else {
                console.error('创建标签失败:', result?.error);
                this.showNotification('创建标签失败', 'error');
            }
        } catch (error) {
            console.error('创建新标签失败:', error);
            this.showNotification('创建新标签失败', 'error');
        }
    }
    
    async switchToTab(tabId) {
        try {
            console.log('切换到标签:', tabId);
            
            const result = await window.electronAPI.tabManager.setActiveTab(tabId);
            if (result?.success) {
                // 状态会通过 onTabsState 事件自动更新
                console.log('标签切换成功');
            } else {
                console.error('切换标签失败:', result?.error);
            }
        } catch (error) {
            console.error('切换标签失败:', error);
        }
    }
    
    async closeTab(tabId) {
        try {
            console.log('关闭标签:', tabId);
            
            const result = await window.electronAPI.tabManager.closeTab(tabId);
            if (result?.success) {
                console.log('标签关闭成功');
                // 状态会通过 onTabsState 事件自动更新
            } else {
                console.error('关闭标签失败:', result?.error);
                this.showNotification('无法关闭该标签', 'error');
            }
        } catch (error) {
            console.error('关闭标签失败:', error);
            this.showNotification('关闭标签失败', 'error');
        }
    }
    
    startRenaming(tabId) {
        // 防止重复编辑
        if (this.editingTabId) {
            this.stopRenaming();
        }
        
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        const titleElement = tabElement?.querySelector('.tab-title');
        
        if (!titleElement) return;
        
        this.editingTabId = tabId;
        const currentTitle = titleElement.textContent;
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tab-title editing';
        input.value = currentTitle;
        
        // 替换标题元素
        titleElement.parentNode.replaceChild(input, titleElement);
        
        // 选中文本
        input.select();
        input.focus();
        
        // 绑定事件
        const finishEditing = async () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                await this.renameTab(tabId, newTitle);
            }
            this.stopRenaming();
        };
        
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            } else if (e.key === 'Escape') {
                this.stopRenaming();
            }
        });
    }
    
    stopRenaming() {
        if (!this.editingTabId) return;
        
        const tabElement = document.querySelector(`[data-tab-id="${this.editingTabId}"]`);
        const inputElement = tabElement?.querySelector('.tab-title.editing');
        
        if (inputElement) {
            // 恢复标题显示
            const tab = this.tabs.find(t => t.id === this.editingTabId);
            const title = document.createElement('span');
            title.className = 'tab-title';
            title.textContent = tab?.displayTitle || tab?.title || '新标签页';
            title.title = title.textContent;
            
            // 重新绑定双击事件
            title.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.startRenaming(this.editingTabId);
            });
            
            inputElement.parentNode.replaceChild(title, inputElement);
        }
        
        this.editingTabId = null;
    }
    
    async renameTab(tabId, newTitle) {
        try {
            console.log('重命名标签:', tabId, newTitle);
            
            const result = await window.electronAPI.tabManager.setCustomTitle(tabId, newTitle);
            if (result?.success) {
                console.log('标签重命名成功');
                // 状态会通过 onTabsState 事件自动更新
            } else {
                console.error('重命名标签失败:', result?.error);
                this.showNotification('重命名失败', 'error');
            }
        } catch (error) {
            console.error('重命名标签失败:', error);
            this.showNotification('重命名失败', 'error');
        }
    }
    
    showContextMenu(event, tabId) {
        const menu = document.getElementById('context-menu');
        if (!menu) return;
        
        this.contextMenuTabId = tabId;
        
        // 设置菜单项状态
        const tab = this.tabs.find(t => t.id === tabId);
        const closeItem = menu.querySelector('[data-action="close"]');
        
        // 持久化标签不能关闭
        if (closeItem) {
            if (tab?.isPersistent) {
                closeItem.classList.add('disabled');
            } else {
                closeItem.classList.remove('disabled');
            }
        }
        
        // 显示菜单
        menu.style.display = 'block';
        menu.style.left = event.pageX + 'px';
        menu.style.top = event.pageY + 'px';
        
        // 确保菜单在视窗内
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (rect.right > viewportWidth) {
            menu.style.left = (event.pageX - rect.width) + 'px';
        }
        
        if (rect.bottom > viewportHeight) {
            menu.style.top = (event.pageY - rect.height) + 'px';
        }
    }
    
    hideContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
        this.contextMenuTabId = null;
    }
    
    async handleContextMenuAction(action, tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        switch (action) {
            case 'rename':
                this.startRenaming(tabId);
                break;
                
            case 'duplicate':
                try {
                    await window.electronAPI.tabManager.createTab({
                        url: tab.url,
                        title: tab.title + ' - 副本',
                        icon: tab.icon
                    });
                } catch (error) {
                    console.error('复制标签失败:', error);
                    this.showNotification('复制标签失败', 'error');
                }
                break;
                
            case 'close-others':
                // 关闭其他非持久化标签
                const otherTabs = this.tabs.filter(t => t.id !== tabId && !t.isPersistent);
                for (const otherTab of otherTabs) {
                    try {
                        await window.electronAPI.tabManager.closeTab(otherTab.id);
                    } catch (error) {
                        console.error('关闭标签失败:', otherTab.id, error);
                    }
                }
                break;
                
            case 'close':
                if (!tab.isPersistent) {
                    await this.closeTab(tabId);
                }
                break;
        }
    }
    
    showError(message) {
        const container = document.getElementById('tabs-container');
        if (container) {
            container.innerHTML = `<div class="error">${message}</div>`;
        }
    }
    
    showNotification(message, type = 'info') {
        // 简单的通知实现，可以后续扩展
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 如果主窗口有通知系统，可以调用
        if (window.electronAPI?.showNotification) {
            window.electronAPI.showNotification(message, message);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('标题栏标签页面加载完成');
    window.headerTabsManager = new HeaderTabsManager();
});

// 导出到全局（用于调试）
window.HeaderTabsManager = HeaderTabsManager;