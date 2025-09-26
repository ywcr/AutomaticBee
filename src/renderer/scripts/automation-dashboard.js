/**
 * 精灵蜂自动化平台主界面脚本
 */

class AutomationDashboard {
  constructor() {
    this.currentTab = "dashboard";
    this.apiManager = null;
    this.automationEngine = null;
    this.validationModule = null;
    this.queueManager = null;
    this.configManager = null;

    // 数据状态
    this.uploadedData = null;
    this.selectedProjectId = null;
    this.selectedQuestionnaireType = null;

    // UI 状态
    this.isExecuting = false;
    this.currentProgress = { current: 0, total: 0 };
    this.isSwitchingAccount = false;
    this.eventsBound = false; // 防止重复绑定事件

    // 标签栏绑定与创建互斥
    this.tabBarBound = false; // 防止标签栏事件重复绑定
    this.isCreatingTab = false; // 防止新建标签被重复触发

    // 标签管理
    this.tabs = [];
    this.activeTabId = null;

    // 分页状态
    this.pagination = {
      contacts: { currentPage: 1, pageSize: 20, total: 0, totalPages: 0 },
      channels: { currentPage: 1, pageSize: 20, total: 0, totalPages: 0 },
      tasks: { currentPage: 1, pageSize: 20, total: 0, totalPages: 0 }
    };

    // 队列标签状态
    this.currentQueueTab = 'pending';

    this.init();
  }

  async init() {
    try {
      // 初始化 IPC 通信
      await this.initIPC();

      // 绑定事件
      this.bindEvents();

      // 初始化界面
      this.initUI();

      // 处理URL参数
      this.handleURLParameters();

      // 检查认证状态
      await this.checkAuthStatus();

      // 初始化标签栏
      await this.initTabBar();

      console.log("自动化平台初始化完成");
    } catch (error) {
      console.error("初始化失败:", error);
      this.showNotification("初始化失败: " + error.message, "error");
    }
  }

  async initIPC() {
    // 检查是否在 Electron 环境中
    if (typeof window.electronAPI !== "undefined") {
      // 监听来自主进程的事件
      window.electronAPI.onTaskProgress((data) => {
        this.handleTaskProgress(data);
      });

      window.electronAPI.onTaskCompleted((data) => {
        this.handleTaskCompleted(data);
      });

      window.electronAPI.onTaskFailed((data) => {
        this.handleTaskFailed(data);
      });

      window.electronAPI.onValidationResult((data) => {
        this.handleValidationResult(data);
      });
    }
  }

  bindEvents() {
    // 防止重复绑定
    if (this.eventsBound) {
      console.log('事件已绑定，跳过重复绑定');
      return;
    }
    this.eventsBound = true;
    console.log('开始绑定事件');

    // 导航菜单事件
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // 文件上传事件
    this.bindFileUploadEvents();

    // 联系人管理事件
    this.bindContactEvents();

    // 渠道管理事件
    this.bindChannelEvents();

    // 任务管理事件
    this.bindTaskManagementEvents();

    // 验证相关事件
    this.bindValidationEvents();

    // 队列管理事件
    this.bindQueueEvents();

    // 设置相关事件
    this.bindSettingsEvents();

    // 模态框事件
    this.bindModalEvents();
  }

  bindFileUploadEvents() {
    const fileInput = document.getElementById("excel-file");
    const uploadArea = document.getElementById("file-upload-area");
    const questionnaireTypeSelect =
      document.getElementById("questionnaire-type");
    const refreshProjectsBtn = document.getElementById("refresh-projects");

    // 文件选择
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // 拖拽上传
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    // 问卷类型选择
    questionnaireTypeSelect.addEventListener("change", (e) => {
      this.selectedQuestionnaireType = e.target.value;
      refreshProjectsBtn.disabled = !e.target.value;

      if (e.target.value) {
        this.updateProjectList();
      }
    });

    // 刷新项目列表
    refreshProjectsBtn.addEventListener("click", () => {
      this.refreshProjects();
    });

    // 日期过滤
    document.getElementById("apply-filter").addEventListener("click", () => {
      this.applyDateFilter();
    });

    // 登录按钮
    document.getElementById("login-btn").addEventListener("click", () => {
      this.openLoginPage();
    });

    // 登出按钮
    document.getElementById("logout-btn").addEventListener("click", () => {
      this.logout();
    });

    // 切换账号按钮
    document.getElementById("switch-account-btn").addEventListener("click", () => {
      this.switchAccount();
    });

    // 刷新认证状态
    document.getElementById("refresh-auth").addEventListener("click", () => {
      this.checkAuthStatus();
    });

    // 快速操作按钮
    document.getElementById("quick-import")?.addEventListener("click", () => {
      this.switchTab('data-import');
    });

    document.getElementById("quick-validate")?.addEventListener("click", () => {
      this.switchTab('validation');
    });
  }

  bindContactEvents() {
    // 联系人管理事件
    document.getElementById("add-contact")?.addEventListener("click", () => {
      this.showContactForm();
    });

    document.getElementById("import-contacts")?.addEventListener("click", () => {
      this.importContacts();
    });

    document.getElementById("search-contacts")?.addEventListener("click", () => {
      this.searchContacts();
    });

    // 联系人搜索框回车事件
    document.getElementById("contact-search")?.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        this.searchContacts();
      }
    });

    // 联系人分页事件
    this.bindPaginationEvents('contacts');
  }

  bindChannelEvents() {
    // 渠道管理事件
    document.getElementById("add-channel")?.addEventListener("click", () => {
      this.showChannelForm();
    });

    document.getElementById("import-channels")?.addEventListener("click", () => {
      this.importChannels();
    });

    document.getElementById("search-channels")?.addEventListener("click", () => {
      this.searchChannels();
    });

    // 渠道搜索框回车事件
    document.getElementById("channel-search")?.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        this.searchChannels();
      }
    });

    // 渠道分页事件
    this.bindPaginationEvents('channels');
  }

  bindTaskManagementEvents() {
    // 任务管理页面事件
    document.getElementById("create-task")?.addEventListener("click", () => {
      this.showTaskForm();
    });

    document.getElementById("refresh-tasks")?.addEventListener("click", () => {
      this.refreshTasks();
    });

    document.getElementById("search-tasks")?.addEventListener("click", () => {
      this.searchTasks();
    });

    // 任务搜索框回车事件
    document.getElementById("task-search")?.addEventListener("keypress", (e) => {
      if (e.key === 'Enter') {
        this.searchTasks();
      }
    });

    // 任务分页事件
    this.bindPaginationEvents('tasks');

    // 打开自动化任务页面
    document.getElementById("open-automation-tasks")?.addEventListener("click", () => {
      window.location.href = 'automation-tasks.html';
    });

    // 自动化任务创建按钮
    document
      .getElementById("create-contacts-task")
      ?.addEventListener("click", () => {
        this.createTask("contacts");
      });

    document
      .getElementById("create-questionnaires-task")
      ?.addEventListener("click", () => {
        this.createTask("questionnaires");
      });

    document
      .getElementById("create-tasks-task")
      ?.addEventListener("click", () => {
        this.createTask("tasks");
      });

    document.getElementById("create-all-task")?.addEventListener("click", () => {
      this.createTask("all");
    });

    // 执行控制
    document.getElementById("pause-execution")?.addEventListener("click", () => {
        this.pauseExecution();
      });

    document
      .getElementById("resume-execution")
      ?.addEventListener("click", () => {
        this.resumeExecution();
      });

    document.getElementById("stop-execution")?.addEventListener("click", () => {
      this.stopExecution();
    });

    // 设置变更
    document.getElementById("concurrency")?.addEventListener("change", (e) => {
      this.updateExecutionSettings({ concurrency: parseInt(e.target.value) });
    });

    document.getElementById("step-delay")?.addEventListener("change", (e) => {
      this.updateExecutionSettings({ stepDelay: parseInt(e.target.value) });
    });
  }

  bindValidationEvents() {
    // 单日验证
    document
      .getElementById("validate-single-date")
      ?.addEventListener("click", () => {
        const date = document.getElementById("validation-date").value;
        if (date) {
          this.validateSingleDate(date);
        }
      });

    // 批量验证
    document
      .getElementById("validate-date-range")
      ?.addEventListener("click", () => {
        const startDate = document.getElementById("batch-start-date").value;
        const endDate = document.getElementById("batch-end-date").value;

        if (startDate && endDate) {
          this.validateDateRange(startDate, endDate);
        }
      });

    // 补漏操作
    document
      .getElementById("auto-retry-missing")
      ?.addEventListener("click", () => {
        this.autoRetryMissing();
      });

    // 导出操作
    document
      .getElementById("export-missing-csv")
      ?.addEventListener("click", () => {
        this.exportMissingCSV();
      });

    document
      .getElementById("export-validation-report")
      ?.addEventListener("click", () => {
        this.exportValidationReport();
      });
  }

  bindQueueEvents() {
    // 设置并发数
    document.getElementById("queue-concurrency-apply")?.addEventListener("click", async () => {
      const val = parseInt(document.getElementById("queue-concurrency-input").value || "1", 10);
      if (window.electronAPI?.automation?.setQueueConcurrency) {
        const res = await window.electronAPI.automation.setQueueConcurrency(val);
        if (res?.success) {
          this.showNotification(`并发数已设置为 ${res.concurrency}`, 'success');
          this.updateQueueDisplay();
        } else {
          this.showNotification(`设置并发数失败: ${res?.error || ''}`, 'error');
        }
      }
    });
    // 队列标签切换
    document.querySelectorAll(".queue-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const queueTab = e.target.dataset.queueTab;
        this.switchQueueTab(queueTab);
      });
    });

    // 队列清理操作
    document.getElementById("clear-completed")?.addEventListener("click", () => {
      this.clearQueue("completed");
    });

    document.getElementById("clear-failed")?.addEventListener("click", () => {
      this.clearQueue("failed");
    });

    document.getElementById("clear-all-queue")?.addEventListener("click", () => {
      this.clearQueue("all");
    });
  }

  bindSettingsEvents() {
    // 设置标签切换
    document.querySelectorAll(".settings-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const settingsTab = e.target.dataset.settingsTab;
        this.switchSettingsTab(settingsTab);
      });
    });
  }

  bindModalEvents() {
    // 模态框关闭
    document.getElementById("modal-close")?.addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    });
  }

  initUI() {
    // 设置默认日期
    const today = new Date().toISOString().split("T")[0];
    const validationDate = document.getElementById("validation-date");
    const batchEndDate = document.getElementById("batch-end-date");
    if (validationDate) validationDate.value = today;
    if (batchEndDate) batchEndDate.value = today;

    // 设置开始日期为一周前
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const batchStartDate = document.getElementById("batch-start-date");
    if (batchStartDate) {
      batchStartDate.value = weekAgo.toISOString().split("T")[0];
    }

    // 更新统计信息
    this.updateDashboardStats();

    // 加载设置界面
    this.loadSettingsUI();
  }

  handleURLParameters() {
    // 处理URL参数，支持从详情页面返回时的操作
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const action = urlParams.get('action');
    const id = urlParams.get('id');

    if (tab) {
      // 切换到指定的标签页
      this.switchTab(tab);

      // 根据操作类型执行相应的动作
      if (action && id) {
        setTimeout(() => {
          switch (action) {
            case 'edit':
              if (tab === 'contacts') {
                this.editContact(id);
              } else if (tab === 'channels') {
                this.editChannel(id);
              } else if (tab === 'tasks') {
                this.editTask(id);
              }
              break;
            case 'view':
              if (tab === 'contacts') {
                this.viewContact(id);
              } else if (tab === 'channels') {
                this.viewChannel(id);
              } else if (tab === 'tasks') {
                this.viewTask(id);
              }
              break;
          }
        }, 500); // 延迟执行，确保标签页切换完成
      }

      // 清除URL参数，避免重复执行
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  switchTab(tabName) {
    // 更新导航状态
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    const navItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (navItem) {
      navItem.classList.add("active");
    }

    // 更新内容区域
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
      tabContent.classList.add("active");
    }

    this.currentTab = tabName;

    // 根据标签页执行特定初始化
    switch (tabName) {
      case "dashboard":
        this.updateDashboardStats();
        break;
      case "contacts":
        this.searchContacts(); // 自动加载联系人列表
        break;
      case "channels":
        this.searchChannels(); // 自动加载渠道列表
        break;
      case "tasks":
        this.refreshTasks(); // 自动加载任务列表
        break;
      case "queue":
        this.updateQueueDisplay();
        break;
      case "logs":
        this.updateLogDisplay();
        break;
      case "settings":
        this.loadSettingsUI();
        break;
    }
  }

  async handleFileUpload(file) {
    try {
      this.updateUploadStatus("正在解析文件...", "info");

      console.log("开始处理文件:", file);

      // 通过 IPC 发送文件到主进程处理
      if (window.electronAPI && window.electronAPI.processExcelFile) {
        // 使用文件路径或文件对象
        const filePath = file.path || file.name;
        console.log("发送文件路径到主进程:", filePath);

        const result = await window.electronAPI.processExcelFile(filePath);
        this.uploadedData = result;
        this.displayDataPreview(result);
        this.updateUploadStatus("文件解析成功", "success");

        // 启用任务创建按钮
        this.enableTaskButtons();
      } else {
        console.warn("electronAPI.processExcelFile 不可用，使用浏览器处理");
        // 浏览器环境的处理逻辑
        const result = await this.processExcelFileInBrowser(file);
        this.uploadedData = result;
        this.displayDataPreview(result);
        this.updateUploadStatus("文件解析成功", "success");

        // 启用任务创建按钮
        this.enableTaskButtons();
      }
    } catch (error) {
      console.error("文件处理失败:", error);
      this.updateUploadStatus("文件处理失败: " + error.message, "error");
    }
  }

  async processExcelFileInBrowser(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // 转换为JSON数据
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // 处理数据格式
          const processedData = this.processRawExcelData(jsonData);

          resolve({
            data: processedData,
            sheetName: sheetName,
            totalRows: jsonData.length
          });
        } catch (error) {
          reject(new Error('Excel文件解析失败: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  processRawExcelData(jsonData) {
    // 标准化数据格式，处理中文字段名
    const processedData = jsonData.map(row => {
      const processedRow = {};

      // 标准化字段名映射
      const fieldMapping = {
        '姓名': 'name',
        '性别': 'gender',
        '手机号': 'phone',
        '联系人类型': 'contactType',
        '指派人': 'assignee',
        '医院名称': 'hospitalName',
        '科室': 'departmentName',
        '地址': 'address',
        '渠道名称': 'channelName',
        '渠道类型': 'channelType',
        '区域': 'area',
        '日期': 'date'
      };

      // 转换字段名
      Object.keys(row).forEach(key => {
        const mappedKey = fieldMapping[key] || key;
        processedRow[mappedKey] = row[key];
      });

      // 确保必要字段存在
      if (!processedRow.assignee && processedRow.name) {
        processedRow.assignee = '默认指派人';
      }

      return processedRow;
    });

    // 按指派人分组
    const groupedData = {};
    processedData.forEach(row => {
      const assignee = row.assignee || '未指派';
      if (!groupedData[assignee]) {
        groupedData[assignee] = [];
      }
      groupedData[assignee].push(row);
    });

    return {
      raw: processedData,
      grouped: groupedData,
      stats: {
        totalRows: processedData.length,
        assignees: Object.keys(groupedData).length,
        assigneeStats: Object.keys(groupedData).map(assignee => ({
          name: assignee,
          count: groupedData[assignee].length
        }))
      }
    };
  }

  updateUploadStatus(message, type = "info") {
    const statusElement = document.getElementById("upload-status");
    statusElement.textContent = message;
    statusElement.className = `upload-status ${type}`;
  }

  displayDataPreview(data) {
    const previewElement = document.getElementById("data-preview");

    if (!data || !data.stats) {
      previewElement.innerHTML = "<p>无数据</p>";
      return;
    }

    const { stats, grouped } = data;

    let html = `
            <div class="data-summary">
                <h4>数据摘要</h4>
                <p>指派人数量: ${stats.assignees}</p>
                <p>总记录数: ${stats.totalRows}</p>
            </div>
            <div class="assignee-preview">
                <h4>指派人列表</h4>
        `;

    stats.assigneeStats.forEach((assigneeStat) => {
      const assignee = assigneeStat.name;
      const count = assigneeStat.count;

      html += `
                <div class="assignee-item">
                    <span class="assignee-name">${assignee}</span>
                    <span class="assignee-count">${count} 条记录</span>
                    <div class="assignee-actions">
                        <button class="btn btn-sm btn-info" onclick="dashboard.createAssigneeTask('${assignee}', 'contacts')">
                            创建联系人
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="dashboard.createAssigneeTask('${assignee}', 'questionnaires')">
                            创建问卷
                        </button>
                        <button class="btn btn-sm btn-success" onclick="dashboard.createAssigneeTask('${assignee}', 'all')">
                            全部创建
                        </button>
                    </div>
                </div>
            `;
    });

    html += "</div>";
    previewElement.innerHTML = html;

    // 启用任务创建按钮
    this.updateTaskButtons(true);
  }

  updateTaskButtons(enabled) {
    document.getElementById("create-contacts-task").disabled = !enabled;
    document.getElementById("create-questionnaires-task").disabled = !enabled;
    document.getElementById("create-tasks-task").disabled = !enabled;
    document.getElementById("create-all-task").disabled = !enabled;
  }

  async checkAuthStatus() {
    try {
      // 检查认证状态但不做强制跳转，仅更新UI
      console.log('检查认证状态...');
      
      let authStatus = { isAuthenticated: false };
      
      // 优先使用 Electron API
      if (window.electronAPI && window.electronAPI.getAuthStatus) {
        try {
          authStatus = await window.electronAPI.getAuthStatus();
          console.log('Electron API 认证状态:', authStatus);
        } catch (error) {
          console.error('使用 Electron API 检查认证失败:', error);
        }
      }
      
      // 如果 Electron API 不可用或失败，使用后备方案
      if (!authStatus.isAuthenticated) {
        const authorization = localStorage.getItem('Authorization');
        if (authorization) {
          try {
            const authData = JSON.parse(decodeURIComponent(authorization));
            if (authData && authData.token) {
              // 验证 token 有效性
              const isValid = await this.validateToken(authData.token);
              if (isValid) {
                authStatus = { 
                  isAuthenticated: true, 
                  currentUser: { 
                    username: authData.username || '已登录', 
                    token: authData.token 
                  } 
                };
                console.log('本地认证有效:', authStatus);
              } else {
                // token 无效，清除本地存储
                console.log('Token 无效，清除本地认证信息');
                localStorage.removeItem('Authorization');
                localStorage.removeItem('userInfo');
              }
            }
          } catch (error) {
            console.error('解析本地认证信息失败:', error);
            localStorage.removeItem('Authorization');
          }
        }
      }
      
      // 使用完整的UI更新（按钮显示/隐藏 + 在线状态）
      this.updateAuthUI(authStatus);
      
      // 记录认证状态检查结果
      if (authStatus.isAuthenticated) {
        console.log('用户已登录:', authStatus.currentUser?.username);
        // 登录成功后更新标签标题
        await this.updateTabAccountInfo(authStatus.currentUser);
      } else {
        console.log('用户未登录');
      }
      
      return authStatus;
    } catch (error) {
      console.error("检查认证状态失败:", error);
      this.updateAuthUI({ isAuthenticated: false });
      return { isAuthenticated: false };
    }
  }

  // Token 有效性验证
  async validateToken(token) {
    try {
      // 检查 token 是否存在且不为空
      if (!token || token.trim() === '') {
        console.log('Token 为空，认为无效');
        return false;
      }
      
      // 尝试调用认证验证接口
      const origin = window.location.origin || 'http://localhost:3000';
      const response = await fetch(origin + '/lgb/user/isAuthenticated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const isValid = data && (data.code === 0 || data.code === 200 || data.success === true);
        console.log('Token 验证结果:', isValid, data);
        return isValid;
      } else {
        console.log('Token 验证请求失败:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token 验证异常:', error);
      // 网络错误或服务器不可达时，判定为未登录，避免误判为已登录
      return false;
    }
  }

  updateAuthDisplay(authStatus) {
    const userElement = document.getElementById("current-user");
    const connectionIndicator = document.getElementById("connection-indicator");
    const connectionText = document.getElementById("connection-text");

    if (authStatus.isAuthenticated) {
      userElement.textContent = authStatus.currentUser?.username || "已登录";
      connectionIndicator.className = "status-indicator online";
      connectionText.textContent = "在线";
    } else {
      userElement.textContent = "未登录";
      connectionIndicator.className = "status-indicator offline";
      connectionText.textContent = "离线";
    }
  }

  showNotification(message, type = "info", duration = 5000) {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;

    container.appendChild(notification);

    // 自动移除通知
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);
  }

  showModal(title, content, buttons = []) {
    const modal = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalFooter = document.getElementById("modal-footer");

    modalTitle.textContent = title;
    modalBody.innerHTML = content;

    modalFooter.innerHTML = "";
    buttons.forEach((button) => {
      const btn = document.createElement("button");
      btn.className = `btn ${button.class || "btn-secondary"}`;
      btn.textContent = button.text;
      btn.onclick = button.onclick;
      modalFooter.appendChild(btn);
    });

    modal.classList.add("show");
  }

  hideModal() {
    document.getElementById("modal-overlay").classList.remove("show");
  }

  updateDashboardStats() {
    // 更新仪表板统计信息
    // 这里应该从实际数据源获取统计信息
    document.getElementById("total-records").textContent =
      this.uploadedData?.stats?.totalRecords || 0;
    document.getElementById("pending-tasks").textContent = "0";
    document.getElementById("completed-tasks").textContent = "0";
    document.getElementById("failed-tasks").textContent = "0";
  }

  updateStatusMessage(message) {
    document.getElementById("status-message").textContent = message;
  }

  // 修复缺失的函数
  loadSettingsUI() {
    console.log("加载设置界面");
    // 这里可以添加设置界面的初始化逻辑
    // 暂时为空实现，避免错误
  }

  async updateProjectList() {
    try {
      if (!this.selectedQuestionnaireType) return;

      console.log("更新项目列表:", this.selectedQuestionnaireType);

      if (window.electronAPI && window.electronAPI.automation) {
        const tasks = await window.electronAPI.automation.getAvailableTasks(
          this.selectedQuestionnaireType
        );
        this.displayProjectList(tasks);
      } else {
        console.warn("electronAPI 不可用");
      }
    } catch (error) {
      console.error("更新项目列表失败:", error);
      this.showNotification("更新项目列表失败: " + error.message, "error");
    }
  }

  async refreshProjects() {
    try {
      console.log("刷新项目列表");
      await this.updateProjectList();
      this.showNotification("项目列表已刷新", "success");
    } catch (error) {
      console.error("刷新项目失败:", error);
      this.showNotification("刷新项目失败: " + error.message, "error");
    }
  }

  displayProjectList(tasks) {
    const projectSelect = document.getElementById("project-select");
    if (!projectSelect) return;

    // 清空现有选项
    projectSelect.innerHTML = '<option value="">请选择项目</option>';

    // 添加项目选项
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        const option = document.createElement("option");
        option.value = task.projectId;
        option.textContent = task.projectTitle;
        projectSelect.appendChild(option);
      });
    }
  }

  applyDateFilter() {
    try {
      const startDate = document.getElementById("start-date")?.value;
      const endDate = document.getElementById("end-date")?.value;

      console.log("应用日期过滤:", startDate, endDate);

      if (this.uploadedData) {
        // 这里可以添加日期过滤逻辑
        this.showNotification("日期过滤已应用", "success");
      } else {
        this.showNotification("请先上传数据文件", "warning");
      }
    } catch (error) {
      console.error("应用日期过滤失败:", error);
      this.showNotification("应用日期过滤失败: " + error.message, "error");
    }
  }



  updateQueueDisplay() {
    // 获取队列状态并渲染
    if (!window.electronAPI?.automation) {
      console.warn('electronAPI.automation 不可用');
      return;
    }

    Promise.all([
      window.electronAPI.automation.getQueueStatus(),
      window.electronAPI.automation.getAllTasks()
    ]).then(([status, tasks]) => {
      if (status) {
        document.getElementById('queue-pending').textContent = status.pending ?? 0;
        document.getElementById('queue-running').textContent = status.running ?? 0;
        document.getElementById('queue-completed').textContent = status.completed ?? 0;
        document.getElementById('queue-failed').textContent = status.failed ?? 0;
        const concInput = document.getElementById('queue-concurrency-input');
        if (concInput && status.maxConcurrency) concInput.value = status.maxConcurrency;
      }

      const listEl = document.getElementById('queue-list');
      if (!listEl) return;
      const tab = this.currentQueueTab || 'pending';
      const arr = Array.isArray(tasks?.[tab]) ? tasks[tab] : [];

      const itemHtml = (t) => `
        <div class="queue-item">
          <div class="queue-item-main">
            <div class="queue-item-title">${t.type || '-'}${t.data?.assignee ? ` · ${t.data.assignee}` : ''}</div>
            <div class="queue-item-meta">创建: ${t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</div>
          </div>
          <div class="queue-item-status">
            <span class="status-badge ${t.status}">${t.status}</span>
          </div>
        </div>`;

      listEl.innerHTML = arr.length ? arr.map(itemHtml).join('') : '<div style="color:#999;">当前无任务</div>';
    }).catch((err) => {
      console.error('获取队列状态失败:', err);
    });
  }

  switchQueueTab(tab) {
    this.currentQueueTab = tab;
    document.querySelectorAll('.queue-tab').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.queue-tab[data-queue-tab="${tab}"]`);
    if (active) active.classList.add('active');
    this.updateQueueDisplay();
  }

  updateLogDisplay() {
    console.log("更新日志显示");
    // 日志显示逻辑
  }

  enableTaskButtons() {
    // 启用任务创建按钮
    const buttons = [
      "create-contacts-task",
      "create-questionnaires-task",
      "create-all-task",
    ];

    buttons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = false;
        console.log(`启用按钮: ${buttonId}`);
      }
    });
  }

  disableTaskButtons() {
    // 禁用任务创建按钮
    const buttons = [
      "create-contacts-task",
      "create-questionnaires-task",
      "create-all-task",
    ];

    buttons.forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = true;
      }
    });
  }

  openLoginPage() {
    // 打开登录页面
    console.log("打开登录页面");
    
    try {
      // 显示加载指示器
      this.showLoadingOverlay('正在跳转到登录页面...');
      
      // 直接使用绝对 URL 导航（兼容 BrowserView + 代理）
      setTimeout(() => {
        try {
          const origin = window.location.origin || 'http://localhost:3000';
          const targetUrl = `${origin}/login.html?returnTo=automation-dashboard.html`;
          console.log('跳转到登录页面:', targetUrl);
          window.location.href = targetUrl;
        } catch (e) {
          window.location.href = '/login.html?returnTo=automation-dashboard.html';
        }
      }, 200); // 给用户一点时间看到加载指示器
      
    } catch (error) {
      console.error('打开登录页面失败:', error);
      this.hideLoadingOverlay();
      this.showNotification('跳转到登录页面失败: ' + error.message, 'error');
    }
  }

  async logout() {
    try {
      console.log("执行本地登出操作（不调用服务器）");

      // 清理本地认证状态
      localStorage.removeItem('Authorization');
      localStorage.removeItem('userInfo');

      // UI 更新
      this.updateAuthUI({ isAuthenticated: false });
      this.showNotification('已退出登录', 'success');

      // 跳转登录页（使用绝对地址，兼容 BrowserView + 代理）
      setTimeout(() => {
        try {
          const origin = window.location.origin || 'http://localhost:3000';
          window.location.href = `${origin}/login.html?returnTo=automation-dashboard.html`;
        } catch (e) {
          window.location.href = '/login.html?returnTo=automation-dashboard.html';
        }
      }, 300);
    } catch (error) {
      console.error("本地登出失败:", error);
      this.showNotification('登出失败: ' + error.message, 'error');
    }
  }

  switchAccount() {
    console.log("切换账号");
    
    // 防止重复执行
    if (this.isSwitchingAccount) {
      console.log('正在切换账号，忽略重复请求');
      return;
    }

    // 在confirm之前设置忙碌标志，防止快速点击导致多个confirm
    this.isSwitchingAccount = true;
    
    // 禁用按钮
    const switchBtn = document.getElementById('switch-account-btn');
    if (switchBtn) {
      switchBtn.disabled = true;
    }

    if (confirm('确定要切换账号吗？当前会话将被清除。')) {
      try {
        // 显示加载指示器
        this.showLoadingOverlay('正在切换账号...');
        this.showNotification('正在切换账号...', 'info');
        
        // 清除当前认证状态
        localStorage.removeItem('Authorization');
        localStorage.removeItem('userInfo');
        
        // 更新 UI 状态
        this.updateAuthUI({ isAuthenticated: false });
        
        // 跳转到登录页面
        setTimeout(() => {
          try {
            const origin = window.location.origin || 'http://localhost:3000';
            const targetUrl = `${origin}/login.html?returnTo=automation-dashboard.html`;
            console.log('切换账号跳转:', targetUrl);
            window.location.href = targetUrl;
          } catch (e) {
            window.location.href = '/login.html?returnTo=automation-dashboard.html';
          }
        }, 500); // 给用户一点时间看到通知
        
      } catch (error) {
        console.error('切换账号失败:', error);
        this.showNotification('切换账号失败: ' + error.message, 'error');
      } finally {
        // 重置标志以允许未来的重试
        this.isSwitchingAccount = false;
        // 恢复按钮状态
        const switchBtn = document.getElementById('switch-account-btn');
        if (switchBtn) {
          switchBtn.disabled = false;
        }
      }
    } else {
      // 用户取消时也要重置标志和按钮
      this.isSwitchingAccount = false;
      const switchBtn = document.getElementById('switch-account-btn');
      if (switchBtn) {
        switchBtn.disabled = false;
      }
    }
  }

  // 原有的 checkAuthStatus 方法已经在前面定义，这里不再重复定义

  // 已删除不需要的认证辅助方法

  updateAuthUI(authStatus) {
    try {
      console.log('更新认证 UI 状态:', authStatus);
      
      // 获取 UI 元素，并检查存在性
      const elements = {
        currentUser: document.getElementById("current-user"),
        loginBtn: document.getElementById("login-btn"),
        logoutBtn: document.getElementById("logout-btn"),
        switchAccountBtn: document.getElementById("switch-account-btn"),
        refreshBtn: document.getElementById("refresh-auth"),
        connectionIndicator: document.getElementById("connection-indicator"),
        connectionText: document.getElementById("connection-text")
      };
      
      // 检查关键元素是否存在
      const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
      
      if (missingElements.length > 0) {
        console.warn('UI 元素缺失:', missingElements);
      }

      if (authStatus && authStatus.isAuthenticated) {
        // 已登录状态
        const username = authStatus.currentUser?.username || "已登录";
        
        if (elements.currentUser) {
          elements.currentUser.textContent = username;
        }
        if (elements.loginBtn) {
          elements.loginBtn.style.display = "none";
        }
        if (elements.logoutBtn) {
          elements.logoutBtn.style.display = "inline-block";
        }
        if (elements.switchAccountBtn) {
          elements.switchAccountBtn.style.display = "inline-block";
        }
        if (elements.refreshBtn) {
          elements.refreshBtn.style.display = "inline-block";
        }
        if (elements.connectionIndicator) {
          elements.connectionIndicator.className = "status-indicator online";
        }
        if (elements.connectionText) {
          elements.connectionText.textContent = "在线";
        }

        console.log("用户已登录:", username);
      } else {
        // 未登录状态
        if (elements.currentUser) {
          elements.currentUser.textContent = "未登录";
        }
        if (elements.loginBtn) {
          elements.loginBtn.style.display = "inline-block";
        }
        if (elements.logoutBtn) {
          elements.logoutBtn.style.display = "none";
        }
        if (elements.switchAccountBtn) {
          elements.switchAccountBtn.style.display = "none";
        }
        if (elements.refreshBtn) {
          elements.refreshBtn.style.display = "none";
        }
        if (elements.connectionIndicator) {
          elements.connectionIndicator.className = "status-indicator offline";
        }
        if (elements.connectionText) {
          elements.connectionText.textContent = "离线";
        }

        console.log("用户未登录");
      }
    } catch (error) {
      console.error('更新认证 UI 失败:', error);
      this.showNotification('界面状态更新失败', 'error');
    }
  }

  // 显示加载指示器
  showLoadingOverlay(text = '正在加载...') {
    try {
      const overlay = document.getElementById('loading-overlay');
      const loadingText = document.getElementById('loading-text');
      
      if (overlay) {
        if (loadingText) {
          loadingText.textContent = text;
        }
        overlay.style.display = 'flex';
        console.log('显示加载指示器:', text);
      }
    } catch (error) {
      console.error('显示加载指示器失败:', error);
    }
  }

  // 隐藏加载指示器
  hideLoadingOverlay() {
    try {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
        console.log('隐藏加载指示器');
      }
    } catch (error) {
      console.error('隐藏加载指示器失败:', error);
    }
  }

  // 标签栏管理方法
  async initTabBar() {
    try {
      // 检查是否在具有 header 参数的环境中
      const urlParams = new URLSearchParams(window.location.search);
      const hasHeader = urlParams.get('header') === '1';
      
      if (hasHeader) {
        console.log('检测到 header=1 参数，跳过页面内标签栏初始化');
        // 隐藏页面内标签栏
        const tabBar = document.getElementById('tab-bar');
        if (tabBar) {
          tabBar.style.display = 'none';
        }
        return;
      }
      
      // 检查是否在 Electron 环境且有标签管理 API
      if (window.electronAPI?.tabManager) {
        console.log('初始化页面内标签栏');
        
        // 显示标签栏
        const tabBar = document.getElementById('tab-bar');
        if (tabBar) {
          tabBar.style.display = 'flex';
        }

        // 绑定新建标签按钮（防止重复绑定）
        const newTabBtn = document.getElementById('tab-new-btn');
        if (newTabBtn && !this.tabBarBound) {
          this.tabBarBound = true;
          newTabBtn.addEventListener('click', () => this.createNewTab());
        }

        // 获取当前所有标签
        await this.refreshTabs();
      }
    } catch (error) {
      console.error('初始化标签栏失败:', error);
    }
  },

  async refreshTabs() {
    try {
      if (!window.electronAPI?.tabManager) return;
      
      const tabsRes = await window.electronAPI.tabManager.getAllTabs();
      const activeRes = await window.electronAPI.tabManager.getActiveTab();
      
      this.tabs = tabsRes?.tabs || [];
      this.activeTabId = activeRes?.tab?.id || null;
      
      this.renderTabs();
    } catch (error) {
      console.error('刷新标签列表失败:', error);
    }
  }

  renderTabs() {
    const tabList = document.getElementById('tab-list');
    if (!tabList) return;

    tabList.innerHTML = '';

    this.tabs.forEach(tab => {
      const tabItem = document.createElement('div');
      tabItem.className = 'tab-item';
      if (tab.id === this.activeTabId) {
        tabItem.classList.add('active');
      }

      // 标签标题（优先自定义标题 > 用户名 > 页面标题）
      const title = document.createElement('span');
      title.className = 'tab-title';
      const displayTitle = (tab.customTitle) || (tab.account && tab.account.username) || tab.title || '新标签页';
      title.textContent = displayTitle;
      
      tabItem.appendChild(title);

      // 不是持久化标签才显示关闭按钮
      if (!tab.isPersistent) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tab-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => {
          e.stopPropagation();
          this.closeTab(tab.id);
        };
        tabItem.appendChild(closeBtn);
      }

      // 点击切换标签
      tabItem.onclick = () => this.switchToTab(tab.id);

      tabList.appendChild(tabItem);
    });
  }

  async createNewTab() {
    try {
      if (!window.electronAPI?.tabManager) return;

      // 防止重复触发（双击、重复事件绑定等）
      if (this.isCreatingTab) {
        console.warn('正在创建标签，忽略重复请求');
        return;
      }
      this.isCreatingTab = true;

      console.log('创建新标签');
      
      // 创建新标签，默认打开登录页
      const result = await window.electronAPI.tabManager.createTab({
        url: 'http://localhost:3000/login.html?returnTo=automation-dashboard.html',
        title: '登录',
        icon: 'fas fa-sign-in-alt'
      });

      if (result?.success) {
        console.log('新标签已创建:', result.tabId);
        // 刷新标签列表
        await this.refreshTabs();
      }
    } catch (error) {
      console.error('创建新标签失败:', error);
      this.showNotification('创建新标签失败', 'error');
    } finally {
      this.isCreatingTab = false;
    }
  }

  async switchToTab(tabId) {
    try {
      if (!window.electronAPI?.tabManager) return;

      console.log('切换到标签:', tabId);
      await window.electronAPI.tabManager.setActiveTab(tabId);
      
      // 以主进程返回为准刷新活动标签，避免选中态不同步
      await this.refreshTabs();
    } catch (error) {
      console.error('切换标签失败:', error);
    }
  }

  async closeTab(tabId) {
    try {
      if (!window.electronAPI?.tabManager) return;

      console.log('关闭标签:', tabId);
      const result = await window.electronAPI.tabManager.closeTab(tabId);
      
      if (result) {
        // 刷新标签列表
        await this.refreshTabs();
      }
    } catch (error) {
      console.error('关闭标签失败:', error);
      this.showNotification('无法关闭该标签', 'error');
    }
  }

  // 更新标签账号信息
  async updateTabAccountInfo(userInfo) {
    try {
      if (!window.electronAPI?.tabManager) return;

      // 如果未能拿到明确用户名，则尝试从后端获取
      let name = userInfo?.username || userInfo?.phone || '';
      if (!name || name === '已登录') {
        try {
          const respUser = await fetch('/lgb/user/getUserName', { method: 'POST' });
          const u = await respUser.json();
          name = (u?.realName || u?.employeeName || u?.username || u?.nick || u?.name || '').trim();
          if (u?.identity === '需求企业' && u?.corpName) {
            name = name ? `${name}(${u.corpName})` : u.corpName;
          }
        } catch {}
      }

      if (!name) return; // 没有可用的名称则不覆盖

      const activeRes = await window.electronAPI.tabManager.getActiveTab();
      const activeTabId = activeRes?.tab?.id;
      if (activeTabId) {
        console.log('更新标签账号信息:', name);
        await window.electronAPI.tabManager.setTabAccount(activeTabId, {
          username: name,
          userId: userInfo?.id,
          phone: userInfo?.phone
        });
        // 刷新标签显示
        await this.refreshTabs();
      }
    } catch (error) {
      console.error('更新标签账号信息失败:', error);
    }
  }

  // 联系人管理方法
  async showContactForm(contact = null) {
    const isEdit = contact !== null;
    const title = isEdit ? '编辑联系人' : '新增联系人';

    // 创建表单HTML
    const formHtml = `
      <form id="contact-form">
        <div class="form-row">
          <div class="form-group">
            <label for="contact-name">姓名 <span class="required">*</span></label>
            <input type="text" id="contact-name" name="name" required value="${contact?.name || ''}">
          </div>
          <div class="form-group">
            <label for="contact-gender">性别</label>
            <select id="contact-gender" name="gender">
              <option value="男" ${contact?.gender === '男' ? 'selected' : ''}>男</option>
              <option value="女" ${contact?.gender === '女' ? 'selected' : ''}>女</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="contact-phone">手机号</label>
            <input type="tel" id="contact-phone" name="phone" value="${contact?.phone || ''}">
          </div>
          <div class="form-group">
            <label for="contact-type">联系人类型</label>
            <select id="contact-type" name="contactType">
              <option value="患者" ${contact?.contactType === '患者' ? 'selected' : ''}>患者</option>
              <option value="医生" ${contact?.contactType === '医生' ? 'selected' : ''}>医生</option>
              <option value="药师" ${contact?.contactType === '药师' ? 'selected' : ''}>药师</option>
              <option value="其他" ${contact?.contactType === '其他' ? 'selected' : ''}>其他</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="contact-address">地址</label>
            <input type="text" id="contact-address" name="address" value="${contact?.address || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="contact-assignee">指派人</label>
            <input type="text" id="contact-assignee" name="assignee" value="${contact?.assignee || ''}">
          </div>
          <div class="form-group">
            <label for="contact-hospital">医院名称</label>
            <input type="text" id="contact-hospital" name="hospitalName" value="${contact?.hospitalName || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="contact-department">科室</label>
            <input type="text" id="contact-department" name="departmentName" value="${contact?.departmentName || ''}">
          </div>
        </div>
      </form>
    `;

    // 创建按钮HTML
    const buttonsHtml = `
      <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">取消</button>
      <button type="button" class="btn btn-primary" onclick="dashboard.saveContact(${isEdit})">保存</button>
    `;

    // 显示模态框
    this.showModal(title, formHtml, buttonsHtml);

    // 存储当前编辑的联系人数据
    this.currentEditingContact = contact;
  }

  async importContacts() {
    console.log('批量导入联系人');
    this.showNotification('批量导入联系人功能开发中...', 'info');
  }

  async searchContacts() {
    const searchTerm = document.getElementById('contact-search')?.value || '';
    const contactType = document.getElementById('contact-type-filter')?.value || '';
    const paginationState = this.pagination.contacts;

    console.log('搜索联系人:', { searchTerm, contactType, page: paginationState.currentPage });

    try {
      const response = await fetch('/lgb/lxrgl/getList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          page: paginationState.currentPage,
          key: searchTerm,
          lxrType: contactType,
          way: 'myLinker',
          hospitalName: '',
          departmentName: '',
          orderKey: '3',
          pageSize: paginationState.pageSize
        })
      });

      const result = await response.json();
      if (result.code === 0) {
        const data = result.data || [];
        this.renderContactsTable(data);

        // 更新分页信息 - 使用正确的 count 字段
        const total = result.count || data.length;
        this.updatePagination('contacts', total);
      } else {
        this.showNotification('搜索失败: ' + result.message, 'error');
      }
    } catch (error) {
      console.error('搜索联系人失败:', error);
      this.showNotification('搜索联系人失败', 'error');
    }
  }

  renderContactsTable(contacts) {
    const tbody = document.getElementById('contacts-tbody');
    if (!tbody) return;

    if (contacts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = contacts.map(contact => `
      <tr>
        <td>${contact.name || '-'}</td>
        <td>${contact.sex || '-'}</td>
        <td>${contact.lxrType || '-'}</td>
        <td>${contact.assignee || '-'}</td>
        <td>${contact.phone || '-'}</td>
        <td>${contact.create_time || '-'}</td>
        <td>
          <button class="action-btn view" onclick="dashboard.viewContact('${contact.recId}')">查看</button>
          <button class="action-btn edit" onclick="dashboard.editContact('${contact.recId}')">编辑</button>
          <button class="action-btn delete" onclick="dashboard.deleteContact('${contact.recId}')">删除</button>
        </td>
      </tr>
    `).join('');
  }

  // 联系人操作方法
  async viewContact(id) {
    try {
      // 跳转到联系人详情页面
      window.location.href = `/contact-detail.html?id=${id}`;
    } catch (error) {
      console.error('查看联系人失败:', error);
      this.showNotification('查看联系人失败', 'error');
    }
  }

  async editContact(id) {
    try {
      // 从当前数据中查找联系人
      const contacts = this.getContactsFromTable();
      const contact = contacts.find(c => c.recId === id);

      if (!contact) {
        this.showNotification('联系人不存在', 'error');
        return;
      }

      // 转换数据格式以适配表单
      const formattedContact = {
        id: contact.recId,  // 修复：使用 recId
        name: contact.name,
        gender: contact.sex,
        contactType: contact.lxrType,
        assignee: contact.assignee,
        phone: contact.phone,
        address: contact.address,
        hospitalName: contact.hospitalName,
        departmentName: contact.departmentName
      };

      this.showContactForm(formattedContact);
    } catch (error) {
      console.error('编辑联系人失败:', error);
      this.showNotification('编辑联系人失败', 'error');
    }
  }

  async deleteContact(id) {
    if (!confirm('确定要删除这个联系人吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch('/lgb/lxrgl/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ id: id })
      });

      const result = await response.json();

      if (result.code === 0) {
        this.showNotification('联系人删除成功', 'success');
        // 刷新联系人列表
        this.searchContacts();
      } else {
        this.showNotification('删除失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('删除联系人失败:', error);
      this.showNotification('删除联系人失败', 'error');
    }
  }

  getContactsFromTable() {
    // 从表格中获取当前显示的联系人数据
    const tbody = document.getElementById('contacts-tbody');
    if (!tbody) return [];

    const rows = tbody.querySelectorAll('tr');
    const contacts = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const editBtn = row.querySelector('.action-btn.edit');
        const id = editBtn ? editBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : null;

        contacts.push({
          recId: id,  // 修复：使用 recId
          name: cells[0].textContent.trim(),
          sex: cells[1].textContent.trim(),
          lxrType: cells[2].textContent.trim(),
          assignee: cells[3].textContent.trim(),
          phone: cells[4].textContent.trim(),
          create_time: cells[5].textContent.trim()  // 修复：使用 create_time
        });
      }
    });

    return contacts;
  }

  // 渠道管理方法
  async showChannelForm(channel = null) {
    const isEdit = channel !== null;
    const title = isEdit ? '编辑渠道' : '新增渠道';

    // 创建表单HTML
    const formHtml = `
      <form id="channel-form">
        <div class="form-row">
          <div class="form-group full-width">
            <label for="channel-name">渠道名称 <span class="required">*</span></label>
            <input type="text" id="channel-name" name="channelName" required value="${channel?.channelName || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="channel-type">渠道类型</label>
            <select id="channel-type" name="channelType">
              <option value="零售渠道档案" ${channel?.channelType === '零售渠道档案' ? 'selected' : ''}>零售渠道档案</option>
              <option value="等级医院档案" ${channel?.channelType === '等级医院档案' ? 'selected' : ''}>等级医院档案</option>
              <option value="基层医疗档案" ${channel?.channelType === '基层医疗档案' ? 'selected' : ''}>基层医疗档案</option>
              <option value="竞品渠道档案" ${channel?.channelType === '竞品渠道档案' ? 'selected' : ''}>竞品渠道档案</option>
            </select>
          </div>
          <div class="form-group">
            <label for="channel-adcode">区域代码</label>
            <input type="text" id="channel-adcode" name="adcode" value="${channel?.adcode || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="channel-address">地址</label>
            <input type="text" id="channel-address" name="address" value="${channel?.address || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="channel-areas">所属区域</label>
            <input type="text" id="channel-areas" name="fullAreas" value="${channel?.fullAreas || ''}">
          </div>
          <div class="form-group">
            <label for="channel-complete">是否完整</label>
            <select id="channel-complete" name="whetherComplete">
              <option value="1" ${channel?.whetherComplete === '1' ? 'selected' : ''}>是</option>
              <option value="0" ${channel?.whetherComplete === '0' ? 'selected' : ''}>否</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="channel-lng">经度</label>
            <input type="text" id="channel-lng" name="lng" value="${channel?.lng || ''}">
          </div>
          <div class="form-group">
            <label for="channel-lat">纬度</label>
            <input type="text" id="channel-lat" name="lat" value="${channel?.lat || ''}">
          </div>
        </div>
      </form>
    `;

    // 创建按钮HTML
    const buttonsHtml = `
      <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">取消</button>
      <button type="button" class="btn btn-primary" onclick="dashboard.saveChannel(${isEdit})">保存</button>
    `;

    // 显示模态框
    this.showModal(title, formHtml, buttonsHtml);

    // 存储当前编辑的渠道数据
    this.currentEditingChannel = channel;
  }

  async saveChannel(isEdit = false) {
    const form = document.getElementById('channel-form');
    const formData = new FormData(form);

    // 验证必填字段
    const channelName = formData.get('channelName');
    if (!channelName || channelName.trim() === '') {
      this.showNotification('请输入渠道名称', 'error');
      return;
    }

    // 构建渠道数据
    const channelData = {
      channelName: channelName.trim(),
      channelType: formData.get('channelType'),
      address: formData.get('address'),
      adcode: formData.get('adcode'),
      fullAreas: formData.get('fullAreas'),
      whetherComplete: formData.get('whetherComplete'),
      lng: formData.get('lng'),
      lat: formData.get('lat')
    };

    // 如果是编辑模式，添加ID
    if (isEdit && this.currentEditingChannel) {
      channelData.id = this.currentEditingChannel.id;
    }

    try {
      // 调用保存API
      const response = await fetch('/lgb/qdkh/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(channelData)
      });

      const result = await response.json();

      if (result.code === 0) {
        this.showNotification(isEdit ? '渠道更新成功' : '渠道创建成功', 'success');
        this.closeModal();
        // 刷新渠道列表
        this.searchChannels();
      } else {
        this.showNotification('保存失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('保存渠道失败:', error);
      this.showNotification('保存渠道失败', 'error');
    }
  }

  async importChannels() {
    console.log('批量导入渠道');
    this.showNotification('批量导入渠道功能开发中...', 'info');
  }

  async searchChannels() {
    const searchTerm = document.getElementById('channel-search')?.value || '';
    const channelType = document.getElementById('channel-type-filter')?.value || '';
    const paginationState = this.pagination.channels;

    console.log('搜索渠道:', { searchTerm, channelType, page: paginationState.currentPage });

    try {
      // 调用渠道列表API - 修复参数名
      const response = await fetch('/lgb/qdkh/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          page: paginationState.currentPage,
          size: paginationState.pageSize,  // 修改为 size
          channelName: searchTerm || '',
          channelType: channelType || ''
        })
      });

      const result = await response.json();
      if (result.code === 0 || result.data) {
        const data = result.data || [];
        this.renderChannelsTable(data);

        // 更新分页信息
        const total = result.count || data.length;  // 使用 count 字段
        this.updatePagination('channels', total);
      } else {
        this.showNotification('搜索失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('搜索渠道失败:', error);
      this.showNotification('搜索渠道失败', 'error');
    }
  }

  renderChannelsTable(channels) {
    const tbody = document.getElementById('channels-tbody');
    if (!tbody) return;

    if (channels.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = channels.map(channel => `
      <tr>
        <td>${channel.channelName || '-'}</td>
        <td>${channel.channelType || '-'}</td>
        <td>${channel.address || '-'}</td>
        <td>${channel.adcode || '-'}</td>
        <td><span class="status-badge ${channel.whetherComplete === '1' ? 'active' : 'inactive'}">${channel.whetherComplete === '1' ? '完整' : '不完整'}</span></td>
        <td>${channel.createtime || '-'}</td>
        <td>
          <button class="action-btn view" onclick="dashboard.viewChannel('${channel.id}')">查看</button>
          <button class="action-btn edit" onclick="dashboard.editChannel('${channel.id}')">编辑</button>
          <button class="action-btn delete" onclick="dashboard.deleteChannel('${channel.id}')">删除</button>
        </td>
      </tr>
    `).join('');
  }

  // 渠道操作方法
  async viewChannel(id) {
    try {
      // 跳转到渠道详情页面
      window.location.href = `/channel-detail.html?id=${id}`;
    } catch (error) {
      console.error('查看渠道失败:', error);
      this.showNotification('查看渠道失败', 'error');
    }
  }

  async editChannel(id) {
    try {
      // 从当前数据中查找渠道
      const channels = this.getChannelsFromTable();
      const channel = channels.find(c => c.id === id);

      if (!channel) {
        this.showNotification('渠道不存在', 'error');
        return;
      }

      this.showChannelForm(channel);
    } catch (error) {
      console.error('编辑渠道失败:', error);
      this.showNotification('编辑渠道失败', 'error');
    }
  }

  async deleteChannel(id) {
    if (!confirm('确定要删除这个渠道吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch('/lgb/qdkh/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ id: id })
      });

      const result = await response.json();

      if (result.code === 0) {
        this.showNotification('渠道删除成功', 'success');
        // 刷新渠道列表
        this.searchChannels();
      } else {
        this.showNotification('删除失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('删除渠道失败:', error);
      this.showNotification('删除渠道失败', 'error');
    }
  }

  getChannelsFromTable() {
    // 从表格中获取当前显示的渠道数据
    const tbody = document.getElementById('channels-tbody');
    if (!tbody) return [];

    const rows = tbody.querySelectorAll('tr');
    const channels = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const editBtn = row.querySelector('.action-btn.edit');
        const id = editBtn ? editBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : null;

        channels.push({
          id: id,
          channelName: cells[0].textContent.trim(),
          channelType: cells[1].textContent.trim(),
          address: cells[2].textContent.trim(),
          adcode: cells[3].textContent.trim(),
          whetherComplete: cells[4].textContent.includes('完整') ? '1' : '0',
          createtime: cells[5].textContent.trim()
        });
      }
    });

    return channels;
  }

  // 任务管理方法
  async showTaskForm(task = null) {
    const isEdit = task !== null;
    const title = isEdit ? '编辑任务' : '创建任务';

    // 创建表单HTML
    const formHtml = `
      <form id="task-form">
        <div class="form-row">
          <div class="form-group">
            <label for="task-title">任务标题 <span class="required">*</span></label>
            <input type="text" id="task-title" name="title" required value="${task?.title || ''}">
          </div>
          <div class="form-group">
            <label for="task-type">任务类型</label>
            <select id="task-type" name="taskType">
              <option value="liuwei_patient" ${task?.taskType === 'liuwei_patient' ? 'selected' : ''}>六味患者问卷</option>
              <option value="xihuang_consumer" ${task?.taskType === 'xihuang_consumer' ? 'selected' : ''}>西黄消费者问卷</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="task-priority">优先级</label>
            <select id="task-priority" name="priority">
              <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>低</option>
              <option value="normal" ${task?.priority === 'normal' ? 'selected' : ''}>普通</option>
              <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>高</option>
              <option value="urgent" ${task?.priority === 'urgent' ? 'selected' : ''}>紧急</option>
            </select>
          </div>
          <div class="form-group">
            <label for="task-status">状态</label>
            <select id="task-status" name="status">
              <option value="pending" ${task?.status === 'pending' ? 'selected' : ''}>待处理</option>
              <option value="running" ${task?.status === 'running' ? 'selected' : ''}>运行中</option>
              <option value="completed" ${task?.status === 'completed' ? 'selected' : ''}>已完成</option>
              <option value="failed" ${task?.status === 'failed' ? 'selected' : ''}>失败</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="task-assignee">指派人</label>
            <input type="text" id="task-assignee" name="assignee" value="${task?.assignee || ''}">
          </div>
          <div class="form-group">
            <label for="task-deadline">截止日期</label>
            <input type="datetime-local" id="task-deadline" name="deadline" value="${task?.deadline || ''}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="task-description">任务描述</label>
            <textarea id="task-description" name="description" rows="4">${task?.description || ''}</textarea>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="task-config">任务配置 (JSON)</label>
            <textarea id="task-config" name="config" rows="6" placeholder='{"concurrency": 1, "delay": 1000, "retryCount": 3}'>${task?.config || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    // 创建按钮HTML
    const buttonsHtml = `
      <button type="button" class="btn btn-secondary" onclick="dashboard.closeModal()">取消</button>
      <button type="button" class="btn btn-primary" onclick="dashboard.saveTask(${isEdit})">保存</button>
    `;

    // 显示模态框
    this.showModal(title, formHtml, buttonsHtml);

    // 存储当前编辑的任务数据
    this.currentEditingTask = task;
  }

  async saveTask(isEdit = false) {
    const form = document.getElementById('task-form');
    const formData = new FormData(form);

    // 验证必填字段
    const title = formData.get('title');
    if (!title || title.trim() === '') {
      this.showNotification('请输入任务标题', 'error');
      return;
    }

    // 验证JSON配置
    const configText = formData.get('config');
    let config = {};
    if (configText && configText.trim()) {
      try {
        config = JSON.parse(configText);
      } catch (error) {
        this.showNotification('任务配置格式错误，请输入有效的JSON', 'error');
        return;
      }
    }

    // 构建任务数据
    const taskData = {
      title: title.trim(),
      taskType: formData.get('taskType'),
      priority: formData.get('priority'),
      status: formData.get('status'),
      assignee: formData.get('assignee'),
      deadline: formData.get('deadline'),
      description: formData.get('description'),
      config: JSON.stringify(config)
    };

    // 如果是编辑模式，添加ID
    if (isEdit && this.currentEditingTask) {
      taskData.id = this.currentEditingTask.id;
    }

    try {
      // 调用保存API
      const response = await fetch('/lgb/workOrder/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(taskData)
      });

      const result = await response.json();

      if (result.code === 0) {
        this.showNotification(isEdit ? '任务更新成功' : '任务创建成功', 'success');
        this.closeModal();
        // 刷新任务列表
        this.refreshTasks();
      } else {
        this.showNotification('保存失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      this.showNotification('保存任务失败', 'error');
    }
  }

  async refreshTasks() {
    console.log('刷新任务列表');
    const paginationState = this.pagination.tasks;

    try {
      const response = await fetch(`/lgb/workOrder/mobile/history/list?projectCategory=2&pageNum=${paginationState.currentPage}&pageSize=${paginationState.pageSize}`);
      const result = await response.json();

      if (result.code === 200) {  // 修复：使用正确的状态码
        const data = result.rows || [];  // 修复：使用 rows 字段
        this.renderTasksTable(data);

        // 更新分页信息
        const total = result.total || data.length;
        this.updatePagination('tasks', total);
      } else {
        this.showNotification('获取任务列表失败: ' + (result.msg || result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      this.showNotification('获取任务列表失败', 'error');
    }
  }

  async searchTasks() {
    const searchTerm = document.getElementById('task-search')?.value || '';
    const taskStatus = document.getElementById('task-status-filter')?.value || '';
    const taskType = document.getElementById('task-type-filter')?.value || '';
    const paginationState = this.pagination.tasks;

    console.log('搜索任务:', { searchTerm, taskStatus, taskType, page: paginationState.currentPage });

    try {
      // 构建查询参数
      const params = new URLSearchParams({
        projectCategory: '2',
        pageNum: paginationState.currentPage,
        pageSize: paginationState.pageSize
      });

      // 添加搜索条件
      if (searchTerm) params.append('keyword', searchTerm);
      if (taskStatus) params.append('status', taskStatus);
      if (taskType) params.append('taskType', taskType);

      const response = await fetch(`/lgb/workOrder/mobile/history/list?${params.toString()}`);
      const result = await response.json();

      if (result.code === 200) {  // 修复：使用正确的状态码
        const data = result.rows || [];  // 修复：使用 rows 字段
        this.renderTasksTable(data);

        // 更新分页信息
        const total = result.total || data.length;
        this.updatePagination('tasks', total);
      } else {
        this.showNotification('搜索失败: ' + (result.msg || result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('搜索任务失败:', error);
      this.showNotification('搜索任务失败', 'error');
    }
  }

  renderTasksTable(tasks) {
    const tbody = document.getElementById('tasks-tbody');
    if (!tbody) return;

    if (tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = tasks.map(task => `
      <tr>
        <td>${task.projectTitle || '-'}</td>
        <td>${task.projectType || '-'}</td>
        <td>${task.projectArea || '-'}</td>
        <td><span class="status-badge ${task.projectStatus === '可实施' ? 'active' : 'pending'}">${task.projectStatus || '-'}</span></td>
        <td>${task.deadline || '-'}</td>
        <td>${task.createTime || '-'}</td>
        <td>
          <button class="action-btn view" onclick="dashboard.viewTask('${task.id}')">查看</button>
          <button class="action-btn edit" onclick="dashboard.editTask('${task.id}')">编辑</button>
        </td>
      </tr>
    `).join('');
  }

  // 任务操作方法
  async viewTask(id) {
    try {
      // 跳转到任务详情页面
      window.location.href = `/task-detail.html?id=${id}`;
    } catch (error) {
      console.error('查看任务失败:', error);
      this.showNotification('查看任务失败', 'error');
    }
  }

  async editTask(id) {
    try {
      // 从当前数据中查找任务
      const tasks = this.getTasksFromTable();
      const task = tasks.find(t => t.id === id);

      if (!task) {
        this.showNotification('任务不存在', 'error');
        return;
      }

      // 转换数据格式以适配表单
      const formattedTask = {
        id: task.id,
        title: task.projectTitle,
        taskType: task.projectType === '六味患者问卷' ? 'liuwei_patient' : 'xihuang_consumer',
        priority: 'normal',
        status: task.projectStatus === '可实施' ? 'pending' : 'completed',
        assignee: task.assignee || '',
        deadline: task.deadline || '',
        description: task.description || '',
        config: task.config || '{}'
      };

      this.showTaskForm(formattedTask);
    } catch (error) {
      console.error('编辑任务失败:', error);
      this.showNotification('编辑任务失败', 'error');
    }
  }

  getTasksFromTable() {
    // 从表格中获取当前显示的任务数据
    const tbody = document.getElementById('tasks-tbody');
    if (!tbody) return [];

    const rows = tbody.querySelectorAll('tr');
    const tasks = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        const editBtn = row.querySelector('.action-btn.edit');
        const id = editBtn ? editBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : null;

        tasks.push({
          id: id,
          projectTitle: cells[0].textContent.trim(),
          projectType: cells[1].textContent.trim(),
          projectArea: cells[2].textContent.trim(),
          projectStatus: cells[3].textContent.trim(),
          deadline: cells[4].textContent.trim(),
          createTime: cells[5].textContent.trim()
        });
      }
    });

    return tasks;
  }

  // 删除重复的 editContact 和 deleteContact 方法，使用上面完整实现的版本

  // 删除重复的任务操作方法，使用上面完整实现的版本

  // 删除重复的渠道操作方法，使用上面完整实现的版本

  // 分页相关方法
  bindPaginationEvents(type) {
    // 首页按钮
    document.getElementById(`${type}-first-page`)?.addEventListener('click', () => {
      this.goToPage(type, 1);
    });

    // 上一页按钮
    document.getElementById(`${type}-prev-page`)?.addEventListener('click', () => {
      const currentPage = this.pagination[type].currentPage;
      if (currentPage > 1) {
        this.goToPage(type, currentPage - 1);
      }
    });

    // 下一页按钮
    document.getElementById(`${type}-next-page`)?.addEventListener('click', () => {
      const currentPage = this.pagination[type].currentPage;
      const totalPages = this.pagination[type].totalPages;
      if (currentPage < totalPages) {
        this.goToPage(type, currentPage + 1);
      }
    });

    // 末页按钮
    document.getElementById(`${type}-last-page`)?.addEventListener('click', () => {
      const totalPages = this.pagination[type].totalPages;
      this.goToPage(type, totalPages);
    });

    // 页面大小选择
    document.getElementById(`${type}-page-size`)?.addEventListener('change', (e) => {
      this.pagination[type].pageSize = parseInt(e.target.value);
      this.pagination[type].currentPage = 1;
      this.refreshData(type);
    });
  }

  goToPage(type, page) {
    this.pagination[type].currentPage = page;
    this.refreshData(type);
  }

  refreshData(type) {
    switch (type) {
      case 'contacts':
        this.searchContacts();
        break;
      case 'channels':
        this.searchChannels();
        break;
      case 'tasks':
        this.refreshTasks();
        break;
    }
  }

  updatePagination(type, total, currentPage = null) {
    const paginationState = this.pagination[type];

    if (currentPage !== null) {
      paginationState.currentPage = currentPage;
    }

    paginationState.total = total;
    paginationState.totalPages = Math.ceil(total / paginationState.pageSize);

    // 更新分页信息显示
    const start = (paginationState.currentPage - 1) * paginationState.pageSize + 1;
    const end = Math.min(paginationState.currentPage * paginationState.pageSize, total);

    const infoElement = document.getElementById(`${type}-pagination-info`);
    if (infoElement) {
      infoElement.textContent = `显示 ${start}-${end} 条，共 ${total} 条记录`;
    }

    // 更新按钮状态
    const firstBtn = document.getElementById(`${type}-first-page`);
    const prevBtn = document.getElementById(`${type}-prev-page`);
    const nextBtn = document.getElementById(`${type}-next-page`);
    const lastBtn = document.getElementById(`${type}-last-page`);

    if (firstBtn) firstBtn.disabled = paginationState.currentPage <= 1;
    if (prevBtn) prevBtn.disabled = paginationState.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = paginationState.currentPage >= paginationState.totalPages;
    if (lastBtn) lastBtn.disabled = paginationState.currentPage >= paginationState.totalPages;

    // 更新页码按钮
    this.updatePageNumbers(type);
  }

  updatePageNumbers(type) {
    const paginationState = this.pagination[type];
    const pagesContainer = document.getElementById(`${type}-pagination-pages`);

    if (!pagesContainer) return;

    const currentPage = paginationState.currentPage;
    const totalPages = paginationState.totalPages;

    // 计算显示的页码范围
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // 确保显示5个页码（如果总页数足够）
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    let html = '';

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage ? 'active' : '';
      html += `<button class="pagination-btn ${isActive}" onclick="dashboard.goToPage('${type}', ${i})">${i}</button>`;
    }

    pagesContainer.innerHTML = html;
  }

  // 模态框相关方法
  showModal(title, bodyHtml, footerHtml = '') {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFooter.innerHTML = footerHtml;

    modal.classList.add('show');

    // 绑定关闭事件
    document.getElementById('modal-close').onclick = () => this.closeModal();
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal();
    };
  }

  closeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('show');
    this.currentEditingContact = null;
  }

  async saveContact(isEdit = false) {
    const form = document.getElementById('contact-form');
    const formData = new FormData(form);

    // 验证必填字段
    const name = formData.get('name');
    if (!name || name.trim() === '') {
      this.showNotification('请输入联系人姓名', 'error');
      return;
    }

    // 构建联系人数据
    const contactData = {
      name: name.trim(),
      gender: formData.get('gender'),
      phone: formData.get('phone'),
      contactType: formData.get('contactType'),
      address: formData.get('address'),
      assignee: formData.get('assignee'),
      hospitalName: formData.get('hospitalName'),
      departmentName: formData.get('departmentName')
    };

    // 如果是编辑模式，添加ID
    if (isEdit && this.currentEditingContact) {
      contactData.id = this.currentEditingContact.id;
    }

    try {
      // 调用保存API
      const response = await fetch('/lgb/lxrgl/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(contactData)
      });

      const result = await response.json();

      if (result.code === 0) {
        this.showNotification(isEdit ? '联系人更新成功' : '联系人创建成功', 'success');
        this.closeModal();
        // 刷新联系人列表
        this.searchContacts();
      } else {
        this.showNotification('保存失败: ' + (result.message || '未知错误'), 'error');
      }
    } catch (error) {
      console.error('保存联系人失败:', error);
      this.showNotification('保存联系人失败', 'error');
    }
  }

  // 自动化执行方法
  async createAssigneeTask(assignee, taskType) {
    try {
      if (!this.uploadedData || !this.uploadedData.grouped) {
        this.showNotification('请先上传Excel文件', 'error');
        return;
      }

      const assigneeData = this.uploadedData.grouped[assignee];
      if (!assigneeData || assigneeData.length === 0) {
        this.showNotification(`指派人 ${assignee} 没有可处理的数据`, 'error');
        return;
      }

      const questionnaireType = document.getElementById('questionnaire-type')?.value;
      if (!questionnaireType) {
        this.showNotification('请先选择问卷类型', 'error');
        return;
      }

      // 显示进度区域
      const progressSection = document.getElementById('execution-progress-section');
      if (progressSection) {
        progressSection.style.display = 'block';
      }

      this.showNotification(`开始为指派人 ${assignee} 创建${this.getTaskTypeText(taskType)}...`, 'info');

      // 切换到执行标签页
      this.switchTab('task-management');

      let contactResults = null;
      let questionnaireResults = null;

      // 根据任务类型执行不同的操作
      switch (taskType) {
        case 'contacts':
          contactResults = await this.createContactsForAssignee(assignee, assigneeData);
          break;
        case 'questionnaires':
          questionnaireResults = await this.createQuestionnairesForAssignee(assignee, assigneeData, questionnaireType);
          break;
        case 'tasks':
          // 创建任务类型的自动化任务
          const taskResults = await this.createTasksForAssignee(assignee, assigneeData);
          this.showTaskCompletionSummary(assignee, 'tasks', null, null, taskResults);
          return;
        case 'all':
          contactResults = await this.createContactsForAssignee(assignee, assigneeData);
          if (contactResults.successful.length > 0) {
            // 只为成功创建的联系人创建问卷
            questionnaireResults = await this.createQuestionnairesForAssignee(assignee, assigneeData, questionnaireType);
          }
          break;
        default:
          throw new Error('未知的任务类型: ' + taskType);
      }

      // 显示最终结果
      this.showTaskCompletionSummary(assignee, taskType, contactResults, questionnaireResults);

    } catch (error) {
      console.error('创建任务失败:', error);
      this.showNotification('创建任务失败: ' + error.message, 'error');
    } finally {
      // 隐藏进度区域
      setTimeout(() => {
        const progressSection = document.getElementById('execution-progress-section');
        if (progressSection) {
          progressSection.style.display = 'none';
        }
      }, 3000);
    }
  }

  // 为指派人创建任务
  async createTasksForAssignee(assignee, assigneeData) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // 更新进度显示
    this.updateExecutionProgress(0, assigneeData.length, '准备创建任务...');

    for (let i = 0; i < assigneeData.length; i++) {
      const data = assigneeData[i];

      try {
        // 更新进度
        this.updateExecutionProgress(i, assigneeData.length, `创建任务: ${data.name || `任务${i+1}`}`);

        // 构建任务数据
        const taskData = {
          title: `${data.name || `任务${i+1}`} - ${assignee}`,
          type: '自动化任务',
          area: data.address || data.area || '全国',
          deadline: this.getDefaultDeadline(),
          description: `为 ${data.name || `数据项${i+1}`} 创建的自动化任务`,
          assignee: assignee,
          priority: 'normal',
          taskType: 'automation'
        };

        // 创建任务
        const taskResult = await this.createTaskForAssignee(assignee, taskData);

        if (taskResult.success) {
          results.successful.push({
            data: data,
            taskId: taskResult.taskId,
            result: taskResult
          });
          console.log(`任务创建成功: ${taskData.title}`);
        } else {
          results.failed.push({
            data: data,
            error: taskResult.message || '创建失败'
          });
          console.log(`任务创建失败: ${taskData.title}, ${taskResult.message}`);
        }

        // 添加延迟
        await this.delay(1000);

      } catch (error) {
        results.failed.push({
          data: data,
          error: error.message
        });
        console.error(`任务创建异常: ${data.name}`, error);
      }
    }

    // 显示最终结果
    const totalProcessed = results.successful.length + results.failed.length + results.skipped.length;
    this.updateExecutionProgress(totalProcessed, totalProcessed, '任务创建完成');

    console.log(`任务创建结果 - 成功: ${results.successful.length}, 失败: ${results.failed.length}, 跳过: ${results.skipped.length}`);

    // 显示结果通知
    if (results.successful.length > 0) {
      this.showNotification(`成功创建 ${results.successful.length} 个任务`, 'success');
    }
    if (results.failed.length > 0) {
      this.showNotification(`${results.failed.length} 个任务创建失败`, 'error');
    }

    return results;
  }

  getTaskTypeText(taskType) {
    const typeMap = {
      'contacts': '联系人',
      'questionnaires': '问卷',
      'tasks': '任务',
      'all': '联系人和问卷'
    };
    return typeMap[taskType] || taskType;
  }

  // 显示任务完成摘要
  showTaskCompletionSummary(assignee, taskType, contactResults, questionnaireResults, taskResults) {
    let summaryMessage = `指派人 ${assignee} 的${this.getTaskTypeText(taskType)}创建完成\n\n`;

    if (contactResults) {
      summaryMessage += `联系人创建结果：\n`;
      summaryMessage += `- 成功：${contactResults.successful.length} 个\n`;
      summaryMessage += `- 失败：${contactResults.failed.length} 个\n`;
      summaryMessage += `- 跳过：${contactResults.skipped.length} 个\n\n`;
    }

    if (questionnaireResults) {
      summaryMessage += `问卷创建结果：\n`;
      summaryMessage += `- 成功：${questionnaireResults.successful.length} 个\n`;
      summaryMessage += `- 失败：${questionnaireResults.failed.length} 个\n`;
      summaryMessage += `- 跳过：${questionnaireResults.skipped.length} 个\n\n`;
    }

    if (taskResults) {
      summaryMessage += `任务创建结果：\n`;
      summaryMessage += `- 成功：${taskResults.successful.length} 个\n`;
      summaryMessage += `- 失败：${taskResults.failed.length} 个\n`;
      summaryMessage += `- 跳过：${taskResults.skipped.length} 个\n`;
    }

    // 显示摘要对话框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>任务完成摘要</h3>
        <pre style="white-space: pre-wrap; font-family: inherit; margin: 15px 0;">${summaryMessage}</pre>
        <div class="modal-buttons">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();">确定</button>
        </div>
      </div>
    `;

    // 绑定按钮事件
    const button = modal.querySelector('button');
    button.onclick = () => modal.remove();

    document.body.appendChild(modal);

    // 同时显示简短通知
    const totalSuccess = (contactResults?.successful.length || 0) +
                        (questionnaireResults?.successful.length || 0) +
                        (taskResults?.successful.length || 0);
    const totalFailed = (contactResults?.failed.length || 0) +
                       (questionnaireResults?.failed.length || 0) +
                       (taskResults?.failed.length || 0);

    if (totalSuccess > 0 && totalFailed === 0) {
      this.showNotification(`任务完成！成功处理 ${totalSuccess} 项`, 'success');
    } else if (totalSuccess > 0 && totalFailed > 0) {
      this.showNotification(`任务完成！成功 ${totalSuccess} 项，失败 ${totalFailed} 项`, 'warning');
    } else if (totalFailed > 0) {
      this.showNotification(`任务完成，但有 ${totalFailed} 项失败`, 'error');
    }
  }

  async createContactsForAssignee(assignee, assigneeData) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // 更新进度显示
    this.updateExecutionProgress(0, assigneeData.length, '准备创建联系人...');

    // 去重处理 - 基于姓名和性别
    const uniqueData = [];
    const seen = new Set();

    for (const contactData of assigneeData) {
      const key = `${contactData.name}_${contactData.gender || contactData.sex || '男'}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(contactData);
      } else {
        results.skipped.push({
          data: contactData,
          reason: '数据重复'
        });
      }
    }

    console.log(`去重后联系人数量: ${uniqueData.length}/${assigneeData.length}`);

    for (let i = 0; i < uniqueData.length; i++) {
      const contactData = uniqueData[i];

      try {
        // 更新进度
        this.updateExecutionProgress(i, uniqueData.length, `创建联系人: ${contactData.name}`);

        // 确定联系人类型
        const questionnaireType = document.getElementById('questionnaire-type')?.value || 'liuwei_patient';
        const contactType = questionnaireType === 'xihuang_consumer' ? '消费者' : '患者';

        // 检查联系人是否已存在
        const existingContact = await this.queryContact(contactData.name, contactData.gender || contactData.sex, contactType);

        if (existingContact && (existingContact.id || existingContact.exists)) {
          results.skipped.push({
            data: contactData,
            reason: '联系人已存在'
          });
          console.log(`联系人已存在: ${contactData.name}`);
          continue;
        }

        // 创建联系人数据
        const createData = {
          name: contactData.name,
          sex: contactData.gender || contactData.sex || '男',
          phone: contactData.phone || '',
          address: contactData.address || '',
          contactType: contactType,
          assignee: assignee,
          hospitalName: contactData.hospitalName || '',
          departmentName: contactData.departmentName || ''
        };

        // 调用保存API
        const createResult = await this.saveContactAPI(createData);

        if (createResult.success) {
          // 创建后延迟并二次校验
          await this.delay(1000);
          const verify = await this.queryContact(contactData.name, createData.sex, contactType);

          results.successful.push({
            data: contactData,
            contactId: createResult.data?.id || createResult.id || verify?.id,
            result: createResult
          });
          console.log(`联系人创建成功: ${contactData.name}`);
        } else {
          results.failed.push({
            data: contactData,
            error: createResult.message || '创建失败'
          });
          console.log(`联系人创建失败: ${contactData.name}, ${createResult.message}`);
        }

        // 添加延迟避免请求过快
        await this.delay(800);

      } catch (error) {
        results.failed.push({
          data: contactData,
          error: error.message
        });
        console.error(`联系人创建异常: ${contactData.name}`, error);
      }
    }

    // 显示最终结果
    const totalProcessed = results.successful.length + results.failed.length + results.skipped.length;
    this.updateExecutionProgress(totalProcessed, totalProcessed, '联系人创建完成');

    console.log(`联系人创建结果 - 成功: ${results.successful.length}, 失败: ${results.failed.length}, 跳过: ${results.skipped.length}`);

    // 显示结果通知
    if (results.successful.length > 0) {
      this.showNotification(`成功创建 ${results.successful.length} 个联系人`, 'success');
    }
    if (results.failed.length > 0) {
      this.showNotification(`${results.failed.length} 个联系人创建失败`, 'error');
    }
    if (results.skipped.length > 0) {
      this.showNotification(`跳过 ${results.skipped.length} 个重复或已存在的联系人`, 'info');
    }

    return results;
  }

  // 保存联系人API调用
  async saveContactAPI(contactData) {
    try {
      const formData = new URLSearchParams({
        recId: '',
        nvcVal: '',
        lxrType: contactData.contactType,
        name: contactData.name,
        sex: contactData.sex,
        remark: '',
        phone: contactData.phone || '',
        address: contactData.address || '',
        hospitalName: contactData.hospitalName || '',
        departmentName: contactData.departmentName || ''
      });

      const response = await fetch('/lgb/lxrgl/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData.toString()
      });

      const result = await response.json();

      return {
        success: result.code === 0,
        message: result.message || '',
        data: result.data || result,
        id: result.data || null
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
        id: null
      };
    }
  }

  // 查询联系人是否存在
  async queryContact(name, sex, contactType) {
    try {
      const response = await fetch('/lgb/lxrgl/getList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          page: 1,
          pageSize: 10,
          key: name,
          lxrType: contactType,
          way: 'myLinker'
        })
      });

      const result = await response.json();

      if (result.code === 0 && result.data && result.data.length > 0) {
        // 查找完全匹配的联系人
        const exactMatch = result.data.find(contact =>
          contact.name === name &&
          contact.sex === sex &&
          contact.lxrType === contactType
        );
        return exactMatch || null;
      }

      return null;
    } catch (error) {
      console.error('查询联系人失败:', error);
      return null;
    }
  }

  async createQuestionnairesForAssignee(assignee, assigneeData, questionnaireType) {
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // 更新进度显示
    this.updateExecutionProgress(0, assigneeData.length, '准备创建问卷...');

    // 获取项目ID
    const projectSelect = document.getElementById('project-select');
    const projectId = projectSelect?.value;

    if (!projectId) {
      this.showNotification('请先选择项目', 'error');
      return results;
    }

    console.log(`开始为指派人 ${assignee} 创建问卷，类型: ${questionnaireType}, 项目ID: ${projectId}`);

    for (let i = 0; i < assigneeData.length; i++) {
      const contactData = assigneeData[i];

      try {
        // 更新进度
        this.updateExecutionProgress(i, assigneeData.length, `创建问卷: ${contactData.name}`);

        // 创建问卷的逻辑
        const questionnaireResult = await this.createQuestionnaireForContact(contactData, questionnaireType, projectId);

        if (questionnaireResult.success) {
          results.successful.push({
            data: contactData,
            questionnaireId: questionnaireResult.questionnaireId,
            result: questionnaireResult
          });
          console.log(`问卷创建成功: ${contactData.name}`);
        } else {
          results.failed.push({
            data: contactData,
            error: questionnaireResult.error || '创建失败'
          });
          console.log(`问卷创建失败: ${contactData.name}, ${questionnaireResult.error}`);
        }

        // 添加延迟
        await this.delay(1500);

      } catch (error) {
        results.failed.push({
          data: contactData,
          error: error.message
        });
        console.error(`问卷创建异常: ${contactData.name}`, error);
      }
    }

    // 显示最终结果
    const totalProcessed = results.successful.length + results.failed.length + results.skipped.length;
    this.updateExecutionProgress(totalProcessed, totalProcessed, '问卷创建完成');

    console.log(`问卷创建结果 - 成功: ${results.successful.length}, 失败: ${results.failed.length}, 跳过: ${results.skipped.length}`);

    // 显示结果通知
    if (results.successful.length > 0) {
      this.showNotification(`成功创建 ${results.successful.length} 个问卷`, 'success');
    }
    if (results.failed.length > 0) {
      this.showNotification(`${results.failed.length} 个问卷创建失败`, 'error');
    }

    return results;
  }

  // 为单个联系人创建问卷 (API方式)
  async createQuestionnaireForContact(contactData, questionnaireType, projectId) {
    try {
      // 问卷类型配置
      const questionnaireConfig = {
        liuwei_patient: {
          name: '六味患者问卷',
          apiEndpoint: '/lgb/hzwj/add',
          saltEndpoint: '/lgb/hzwj/createDynamicsSalt',
          contactType: '患者'
        },
        xihuang_consumer: {
          name: '西黄消费者问卷',
          apiEndpoint: '/lgb/xfzwj/add',
          saltEndpoint: '/lgb/payMerge/createDynamicsSalt?methodName=%2Fxfzwj%2Fadd',
          contactType: '消费者'
        }
      };

      const config = questionnaireConfig[questionnaireType];
      if (!config) {
        throw new Error(`未知的问卷类型: ${questionnaireType}`);
      }

      console.log(`开始为 ${contactData.name} 创建 ${config.name}`);

      // 步骤1: 获取动态盐值
      const salt = await this.getDynamicsSalt(config.saltEndpoint);

      // 步骤2: 构建问卷数据
      const questionnaireData = this.buildQuestionnaireData(contactData, questionnaireType, projectId, salt);

      // 步骤3: 提交问卷
      const result = await this.submitQuestionnaire(config.apiEndpoint, questionnaireData);

      if (result.success) {
        console.log(`问卷创建成功: ${contactData.name}, ID: ${result.questionnaireId}`);
        return {
          success: true,
          questionnaireId: result.questionnaireId,
          message: '问卷创建成功'
        };
      } else {
        throw new Error(result.message || '问卷创建失败');
      }

    } catch (error) {
      console.error(`问卷创建失败: ${contactData.name}`, error);
      return {
        success: false,
        error: error.message,
        questionnaireId: null
      };
    }
  }

  // 获取动态盐值
  async getDynamicsSalt(saltEndpoint) {
    try {
      const response = await fetch(saltEndpoint, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const result = await response.json();

      if (result.code === 0 && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || '获取盐值失败');
      }
    } catch (error) {
      console.error('获取动态盐值失败:', error);
      // 如果获取盐值失败，返回空字符串继续尝试
      return '';
    }
  }

  // 构建问卷数据
  buildQuestionnaireData(contactData, questionnaireType, projectId, salt = '') {
    const baseData = {
      name: contactData.name,
      gender: contactData.gender || contactData.sex || '男',
      projectId: projectId,
      submitTime: new Date().toISOString().split('T')[0]
    };

    // 添加盐值
    if (salt) {
      baseData.salt = salt;
    }

    // 根据问卷类型添加特定字段和问卷答案
    if (questionnaireType === 'liuwei_patient') {
      baseData.patientName = contactData.name;
      // 添加六味地黄丸问卷答案
      const answers = this.generateLiuweiQuestionnaireAnswers(contactData);
      Object.assign(baseData, answers);
    } else if (questionnaireType === 'xihuang_consumer') {
      baseData.consumerName = contactData.name;
      // 添加西黄丸问卷答案
      const answers = this.generateXihuangQuestionnaireAnswers(contactData);
      Object.assign(baseData, answers);
    }

    return baseData;
  }

  // 生成六味地黄丸问卷答案
  generateLiuweiQuestionnaireAnswers(contactData) {
    // 基于原始脚本的逻辑生成问卷答案
    const answers = {};

    // 示例问卷答案 - 实际应该根据业务逻辑生成
    const questionAnswers = [
      '是', '否', '是', '否', '是',
      '否', '是', '否', '是', '否'
    ];

    questionAnswers.forEach((answer, index) => {
      answers[`question_${index + 1}`] = answer;
    });

    return answers;
  }

  // 生成西黄丸问卷答案
  generateXihuangQuestionnaireAnswers(contactData) {
    // 基于原始脚本的逻辑生成问卷答案
    const answers = {};

    // 示例问卷答案 - 实际应该根据业务逻辑生成
    const questionAnswers = [
      '是', '否', '是', '否', '是',
      '否', '是', '否', '是', '否'
    ];

    questionAnswers.forEach((answer, index) => {
      answers[`question_${index + 1}`] = answer;
    });

    return answers;
  }

  // 提交问卷
  async submitQuestionnaire(apiEndpoint, questionnaireData) {
    try {
      const formData = new URLSearchParams();

      // 将问卷数据转换为表单数据
      Object.keys(questionnaireData).forEach(key => {
        formData.append(key, questionnaireData[key]);
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData.toString()
      });

      const result = await response.json();

      if (result.code === 0) {
        return {
          success: true,
          questionnaireId: result.data || result.recId || `questionnaire_${Date.now()}`,
          message: result.message || '问卷创建成功'
        };
      } else {
        return {
          success: false,
          message: result.message || '问卷创建失败',
          questionnaireId: null
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        questionnaireId: null
      };
    }
  }

  // 创建任务 (API方式)
  async createTaskForAssignee(assignee, taskData) {
    try {
      const taskPayload = {
        projectTitle: taskData.title || `${assignee}的自动化任务`,
        projectType: taskData.type || '自动化任务',
        projectArea: taskData.area || '全国',
        projectStatus: '可实施',
        deadline: taskData.deadline || this.getDefaultDeadline(),
        description: taskData.description || `为指派人${assignee}创建的自动化任务`,
        assignee: assignee,
        priority: taskData.priority || 'normal',
        taskType: taskData.taskType || 'automation'
      };

      const response = await fetch('/lgb/workOrder/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(taskPayload)
      });

      const result = await response.json();

      if (result.code === 0) {
        return {
          success: true,
          taskId: result.data || result.recId,
          message: '任务创建成功'
        };
      } else {
        return {
          success: false,
          message: result.message || '任务创建失败',
          taskId: null
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        taskId: null
      };
    }
  }

  // 获取默认截止日期 (7天后)
  getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  // 更新执行进度
  updateExecutionProgress(current, total, message) {
    const progressElement = document.getElementById('execution-progress');
    const statusElement = document.getElementById('execution-status');

    if (progressElement) {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      progressElement.style.width = `${percentage}%`;
      progressElement.textContent = `${percentage}%`;
    }

    if (statusElement) {
      statusElement.textContent = message || `处理中 ${current}/${total}`;
    }

    console.log(`进度: ${current}/${total} - ${message}`);
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkContactExists(name, phone) {
    try {
      const response = await fetch('/lgb/lxrgl/getList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          page: 1,
          pageSize: 10,
          key: name,
          way: 'myLinker'
        })
      });

      const result = await response.json();

      if (result.code === 0 && result.data && result.data.length > 0) {
        // 检查是否有完全匹配的联系人
        return result.data.find(contact =>
          contact.name === name && (contact.phone === phone || !phone)
        );
      }

      return null;
    } catch (error) {
      console.error('检查联系人是否存在失败:', error);
      return null;
    }
  }
}

// 全局实例
let dashboard;

// 全局方法 (用于兼容性)
function closeModal() {
  if (dashboard) {
    dashboard.closeModal();
  }
}

function createAssigneeTask(assignee, type) {
  if (dashboard) {
    dashboard.createAssigneeTask(assignee, type);
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new AutomationDashboard();
  window.dashboard = dashboard; // 暴露到全局作用域以便调试
});
