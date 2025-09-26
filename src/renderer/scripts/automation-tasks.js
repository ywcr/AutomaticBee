/**
 * 自动化任务管理脚本
 */

class AutomationTaskManager {
    constructor() {
        this.currentTask = 'liuwei_patient';
        this.uploadedData = {};
        this.isExecuting = false;
        this.executionStats = {
            total: 0,
            completed: 0,
            failed: 0,
            current: ''
        };
        
        // 是否运行在 Electron 环境
        this.isElectron = typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
        // 任务类型映射到主进程队列的类型
        this.taskTypeMap = {
            contacts: 'create_contacts',
            questionnaires: 'create_questionnaires',
            all: 'create_all'
        };
        
        this.init();
    }

    async init() {
        try {
            // 绑定事件
            this.bindEvents();

            // 绑定与主进程的事件（如果在 Electron 环境）
            if (this.isElectron) {
                this.bindIpcEvents();
            }
            
            // 检查认证状态
            await this.checkAuthStatus();
            
            // 初始化界面
            this.initUI();
            
            this.log('系统初始化完成', 'success');
        } catch (error) {
            console.error('初始化失败:', error);
            this.log('初始化失败: ' + error.message, 'error');
        }
    }

    bindEvents() {
        // 返回仪表板
        document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
            window.location.href = 'automation-dashboard.html';
        });

        // 登出
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // 任务类型切换
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const taskType = e.currentTarget.dataset.task;
                this.switchTask(taskType);
            });
        });

        // 文件上传事件
        this.bindFileUploadEvents();

        // 执行控制事件
        this.bindExecutionEvents();

        // 日志控制事件
        this.bindLogEvents();
    }

    bindIpcEvents() {
        // 来自主进程的队列任务事件
        window.electronAPI.onQueueTaskStarted?.((task) => {
            // task 包含 id, type, data 等
            this.log(`任务开始: ${task.type} -> ${task.data?.assignee || ''}`, 'info');
        });
        window.electronAPI.onQueueTaskCompleted?.((task) => {
            this.log(`任务完成: ${task.type} -> ${task.data?.assignee || ''}`, 'success');
        });

        // 自动化执行过程进度（逐条联系人/问卷）
        window.electronAPI.onTaskProgress?.(({ type, data }) => {
            if (data && typeof data.current === 'number' && typeof data.total === 'number') {
                // 将主进程的进度反映到当前任务 UI 上
                this.executionStats.total = data.total;
                // 这里无法区分成功/失败具体数量，使用 current 表示已处理数量
                const processed = Math.max(data.current - 1, 0); // 当前是第N条，已完成N-1
                this.executionStats.completed = processed;
                this.executionStats.failed = 0; // 失败统计由日志体现
                this.executionStats.current = `${data.phase === 'contacts' ? '创建联系人' : '创建问卷'}: ${data.item || ''}`;
                this.updateProgress();
            }
        });
        window.electronAPI.onTaskCompleted?.((payload) => {
            this.executionStats.current = '执行完成';
            this.updateProgress();
        });
        window.electronAPI.onTaskFailed?.((payload) => {
            this.executionStats.current = `执行失败: ${payload?.error?.message || ''}`;
            this.log(this.executionStats.current, 'error');
            this.updateProgress();
        });
    }

    bindFileUploadEvents() {
        // 六味患者问卷文件上传
        const liuweiFileInput = document.getElementById('liuwei-file-input');
        const liuweiUploadArea = document.getElementById('liuwei-upload-area');

        // 点击上传区域时，优先使用系统对话框（Electron）
        liuweiUploadArea?.addEventListener('click', async (e) => {
            if (this.isElectron && window.electronAPI?.selectAndProcessExcel) {
                e.preventDefault();
                await this.selectExcelAndProcess('liuwei_patient');
            }
        });
        
        liuweiFileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], 'liuwei_patient');
        });

        // 拖拽上传
        liuweiUploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            liuweiUploadArea.classList.add('dragover');
        });

        liuweiUploadArea?.addEventListener('dragleave', () => {
            liuweiUploadArea.classList.remove('dragover');
        });

        liuweiUploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            liuweiUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0], 'liuwei_patient');
            }
        });

        // 移除文件
        document.getElementById('liuwei-remove-file')?.addEventListener('click', () => {
            this.removeFile('liuwei_patient');
        });

        // 西黄消费者问卷文件上传（类似的事件绑定）
        const xihuangFileInput = document.getElementById('xihuang-file-input');
        const xihuangUploadArea = document.getElementById('xihuang-upload-area');

        xihuangUploadArea?.addEventListener('click', async (e) => {
            if (this.isElectron && window.electronAPI?.selectAndProcessExcel) {
                e.preventDefault();
                await this.selectExcelAndProcess('xihuang_consumer');
            }
        });
        
        xihuangFileInput?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], 'xihuang_consumer');
        });

        // 西黄拖拽上传
        xihuangUploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            xihuangUploadArea.classList.add('dragover');
        });

        xihuangUploadArea?.addEventListener('dragleave', () => {
            xihuangUploadArea.classList.remove('dragover');
        });

        xihuangUploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            xihuangUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0], 'xihuang_consumer');
            }
        });

        document.getElementById('xihuang-remove-file')?.addEventListener('click', () => {
            this.removeFile('xihuang_consumer');
        });
    }

    bindExecutionEvents() {
        // 六味患者问卷执行按钮
        document.getElementById('liuwei-start-contacts')?.addEventListener('click', () => {
            this.startExecution('liuwei_patient', 'contacts');
        });

        document.getElementById('liuwei-start-questionnaires')?.addEventListener('click', () => {
            this.startExecution('liuwei_patient', 'questionnaires');
        });

        document.getElementById('liuwei-start-all')?.addEventListener('click', () => {
            this.startExecution('liuwei_patient', 'all');
        });
    }

    bindLogEvents() {
        // 清空日志
        document.getElementById('clear-logs')?.addEventListener('click', () => {
            this.clearLogs();
        });

        // 切换日志面板
        document.getElementById('toggle-logs')?.addEventListener('click', () => {
            this.toggleLogPanel();
        });
    }

    switchTask(taskType) {
        // 更新标签状态
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-task="${taskType}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.task-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(taskType).classList.add('active');

        this.currentTask = taskType;
        this.log(`切换到${taskType === 'liuwei_patient' ? '六味患者问卷' : '西黄消费者问卷'}`, 'info');
    }

    async handleFileUpload(file, taskType) {
        if (!file) return;

        this.log(`开始处理文件: ${file.name}`, 'info');

        try {
            // 验证文件类型
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                throw new Error('请选择Excel文件(.xlsx或.xls)');
            }

            // 读取文件
            const data = await this.readExcelFile(file);
            
            // 存储数据
            this.uploadedData[taskType] = {
                file: file,
                data: data,
                uploadTime: new Date()
            };

            // 更新界面
            this.updateFileInfo(file, taskType);
            this.updateDataPreview(data, taskType);
            this.updateAssigneeList(data, taskType);
            this.enableExecutionButtons(taskType);

            this.log(`文件处理完成，共${data.length}条记录`, 'success');

        } catch (error) {
            console.error('文件处理失败:', error);
            this.log('文件处理失败: ' + error.message, 'error');
        }
    }

    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    updateFileInfo(file, taskType) {
        const fileInfo = document.getElementById(`${taskType.split('_')[0]}-file-info`);
        const uploadArea = document.getElementById(`${taskType.split('_')[0]}-upload-area`);
        
        if (fileInfo && uploadArea) {
            fileInfo.style.display = 'flex';
            uploadArea.style.display = 'none';
            
            fileInfo.querySelector('.file-name').textContent = file.name;
            fileInfo.querySelector('.file-size').textContent = this.formatFileSize(file.size);
        }
    }

    updateDataPreview(data, taskType) {
        const preview = document.getElementById(`${taskType.split('_')[0]}-data-preview`);
        if (!preview || !data.length) return;

        const headers = Object.keys(data[0]);
        const previewData = data.slice(0, 5); // 只显示前5条

        let html = `
            <table class="preview-table">
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${previewData.map(row => 
                        `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
                    ).join('')}
                </tbody>
            </table>
            <div class="preview-info">
                显示前5条，共${data.length}条记录
            </div>
        `;

        preview.innerHTML = html;
    }

    updateAssigneeList(data, taskType) {
        // 根据指派人分组数据
        const assigneeGroups = {};
        data.forEach(row => {
            const assignee = row['指派人'] || row['assignee'] || '未指定';
            if (!assigneeGroups[assignee]) {
                assigneeGroups[assignee] = [];
            }
            assigneeGroups[assignee].push(row);
        });

        const assigneeList = document.getElementById(`${taskType.split('_')[0]}-assignee-list`);
        if (!assigneeList) return;

        let html = '';
        Object.entries(assigneeGroups).forEach(([assignee, items]) => {
            html += `
                <div class="assignee-item">
                    <div class="assignee-info">
                        <span class="assignee-name">${assignee}</span>
                        <span class="assignee-count">${items.length}条记录</span>
                    </div>
                </div>
            `;
        });

        assigneeList.innerHTML = html;
    }

    enableExecutionButtons(taskType) {
        const prefix = taskType.split('_')[0];
        document.getElementById(`${prefix}-start-contacts`).disabled = false;
        document.getElementById(`${prefix}-start-questionnaires`).disabled = false;
        document.getElementById(`${prefix}-start-all`).disabled = false;
    }

    removeFile(taskType) {
        delete this.uploadedData[taskType];
        
        const prefix = taskType.split('_')[0];
        const fileInfo = document.getElementById(`${prefix}-file-info`);
        const uploadArea = document.getElementById(`${prefix}-upload-area`);
        const preview = document.getElementById(`${prefix}-data-preview`);
        const assigneeList = document.getElementById(`${prefix}-assignee-list`);
        
        if (fileInfo && uploadArea) {
            fileInfo.style.display = 'none';
            uploadArea.style.display = 'block';
        }
        
        if (preview) {
            preview.innerHTML = '<p class="no-data">请先上传Excel文件</p>';
        }
        
        if (assigneeList) {
            assigneeList.innerHTML = '';
        }

        // 禁用执行按钮
        document.getElementById(`${prefix}-start-contacts`).disabled = true;
        document.getElementById(`${prefix}-start-questionnaires`).disabled = true;
        document.getElementById(`${prefix}-start-all`).disabled = true;

        this.log('文件已移除', 'info');
    }

    async startExecution(taskType, executionType) {
        if (this.isExecuting) {
            this.log('已有任务在执行中，请等待完成', 'warning');
            return;
        }

        const data = this.uploadedData[taskType];
        if (!data) {
            this.log('请先上传数据文件', 'warning');
            return;
        }

        this.isExecuting = true;
        this.log(`开始执行${executionType}任务`, 'info');

        try {
            if (this.isElectron) {
                await this.enqueueElectronTasks(taskType, executionType, data.data);
            } else {
                // 纯浏览器环境回退为模拟执行
                await this.simulateExecution(taskType, executionType, data.data);
            }
        } catch (error) {
            console.error('执行失败:', error);
            this.log('执行失败: ' + error.message, 'error');
        } finally {
            this.isExecuting = false;
        }
    }

    async selectExcelAndProcess(taskType) {
        try {
            const res = await window.electronAPI.selectAndProcessExcel();
            if (!res?.success) {
                if (!res?.canceled) this.log('选择/解析Excel失败', 'error');
                return;
            }
            const { filePath, data } = res; // data: { groupedData, filteredData, stats }
            // 展示文件名
            this.updateFileInfoFromPath(filePath, taskType);
            // 扁平化为数组供预览和后续分组
            const flat = this.flattenProcessedData(data, taskType);
            this.uploadedData[taskType] = {
                file: { name: (filePath || '').split(/[/\\]/).pop(), size: 0 },
                data: flat,
                uploadTime: new Date()
            };
            this.updateDataPreview(flat, taskType);
            this.updateAssigneeList(flat, taskType);
            this.enableExecutionButtons(taskType);
            this.log(`文件解析成功: ${filePath}`, 'success');
        } catch (err) {
            console.error('系统选择/解析失败:', err);
            this.log('系统选择/解析失败: ' + err.message, 'error');
        }
    }

    flattenProcessedData(processed, questionnaireType) {
        // processed: { groupedData, filteredData, stats }
        const result = [];
        const groups = processed?.filteredData || processed?.groupedData || {};
        Object.keys(groups).forEach((assignee) => {
            const items = groups[assignee] || [];
            items.forEach((it) => {
                result.push({
                    姓名: it.姓名 || it.name || '',
                    性别: it.性别 || it.gender || '',
                    指派人: it.指派人 || assignee || '未指定',
                    时间: it.时间 || null,
                    questionnaireType: it.questionnaireType || questionnaireType
                });
            });
        });
        return result;
    }

    updateFileInfoFromPath(filePath, taskType) {
        const prefix = taskType.split('_')[0];
        const fileInfo = document.getElementById(`${prefix}-file-info`);
        const uploadArea = document.getElementById(`${prefix}-upload-area`);
        if (fileInfo && uploadArea) {
            fileInfo.style.display = 'flex';
            uploadArea.style.display = 'none';
            const name = (filePath || '').split(/[/\\]/).pop();
            fileInfo.querySelector('.file-name').textContent = name || '已选择文件';
            fileInfo.querySelector('.file-size').textContent = '';
        }
    }

    async simulateExecution(taskType, executionType, data) {
        this.executionStats = {
            total: data.length,
            completed: 0,
            failed: 0,
            current: '准备中...'
        };

        this.updateProgress();

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            this.executionStats.current = `处理: ${item['姓名'] || item['name'] || `记录${i+1}`}`;
            this.updateProgress();

            // 模拟处理时间
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 模拟成功/失败
            if (Math.random() > 0.1) { // 90%成功率
                this.executionStats.completed++;
                this.log(`✓ ${this.executionStats.current}`, 'success');
            } else {
                this.executionStats.failed++;
                this.log(`✗ ${this.executionStats.current} - 失败`, 'error');
            }

            this.updateProgress();
        }

        this.executionStats.current = '执行完成';
        this.updateProgress();
        this.log(`任务执行完成！成功: ${this.executionStats.completed}, 失败: ${this.executionStats.failed}`, 'success');
    }

    // 将 Excel 行数据规范化为后端预期格式
    normalizeRows(rows, questionnaireType) {
        return (rows || []).map((row) => {
            const name = row['姓名'] || row['患者姓名'] || row['消费者姓名'] || row['name'] || row['Name'] || '';
            const gender = row['性别'] || row['gender'] || row['Gender'] || '';
            const assignee = row['指派人'] || row['assignee'] || row['Assignee'] || '未指定';
            const date = row['时间'] || row['日期'] || row['date'] || row['Date'] || '';
            let timeObj = null;
            if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [y, m, d] = date.split('-');
                timeObj = { original: date, formatted: `${m}.${d}`, fullDate: date };
            }
            return {
                姓名: name,
                性别: gender,
                指派人: assignee,
                时间: timeObj,
                questionnaireType
            };
        });
    }

    // 根据指派人分组
    groupByAssignee(items) {
        const groups = {};
        items.forEach((it) => {
            const key = it.指派人 || '未指定';
            if (!groups[key]) groups[key] = [];
            groups[key].push(it);
        });
        return groups;
    }

    // 通过 Electron 队列创建真实任务
    async enqueueElectronTasks(taskType, executionType, rows) {
        const questionnaireType = taskType; // 与当前 tab 一致
        const normalized = this.normalizeRows(rows, questionnaireType);
        const groups = this.groupByAssignee(normalized);

        // 统计总条目数用于进度条
        this.executionStats = {
            total: normalized.length,
            completed: 0,
            failed: 0,
            current: '准备中...'
        };
        this.updateProgress();

        const createdTaskIds = [];
        for (const [assignee, items] of Object.entries(groups)) {
            const type = this.taskTypeMap[executionType] || 'create_all';
            const taskConfig = {
                type,
                priority: 0,
                maxRetries: 3,
                data: this.buildTaskDataPayload(type, assignee, questionnaireType, items)
            };
            try {
                const taskId = await window.electronAPI.automation.createTask(taskConfig);
                if (taskId) createdTaskIds.push(taskId);
                this.log(`已加入队列: ${assignee} (${items.length} 条)`, 'info');
            } catch (err) {
                this.log(`加入队列失败: ${assignee} - ${err.message}`, 'error');
            }
        }

        if (createdTaskIds.length === 0) {
            throw new Error('没有创建任何队列任务');
        }

        this.log(`共创建 ${createdTaskIds.length} 个队列任务，正在后台执行...`, 'success');
    }

    buildTaskDataPayload(type, assignee, questionnaireType, items) {
        switch (type) {
            case 'create_contacts':
                return { assignee, data: items };
            case 'create_questionnaires':
                return { assignee, questionnaireType, data: items };
            case 'create_all':
            default:
                return { assignee, questionnaireType, data: items, options: {} };
        }
    }

    updateProgress() {
        const prefix = this.currentTask.split('_')[0];
        const progressContainer = document.getElementById(`${prefix}-progress`);
        if (!progressContainer) return;

        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressText = progressContainer.querySelector('.progress-text');
        const currentTask = progressContainer.querySelector('.detail-item:nth-child(1) .value');
        const successCount = progressContainer.querySelector('.detail-item:nth-child(2) .value');
        const errorCount = progressContainer.querySelector('.detail-item:nth-child(3) .value');

        const percentage = this.executionStats.total > 0 
            ? ((this.executionStats.completed + this.executionStats.failed) / this.executionStats.total) * 100 
            : 0;

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${this.executionStats.completed + this.executionStats.failed}/${this.executionStats.total}`;
        if (currentTask) currentTask.textContent = this.executionStats.current;
        if (successCount) successCount.textContent = this.executionStats.completed;
        if (errorCount) errorCount.textContent = this.executionStats.failed;
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/lgb/user/isAuthenticated');
            const result = await response.json();
            
            if (result.code === 0 && result.data) {
                document.getElementById('current-user').textContent = result.data.userName || '已登录';
            } else {
                document.getElementById('current-user').textContent = '未登录';
            }
        } catch (error) {
            console.error('检查认证状态失败:', error);
            document.getElementById('current-user').textContent = '未知状态';
        }
    }

    async logout() {
        try {
            await fetch('/lgb/user/logout', { method: 'POST' });
            window.location.href = 'login.html';
        } catch (error) {
            console.error('登出失败:', error);
            this.log('登出失败', 'error');
        }
    }

    initUI() {
        // 初始化界面状态
        this.switchTask('liuwei_patient');
    }

    log(message, type = 'info') {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;

        const timestamp = new Date().toLocaleString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="message">${message}</span>
        `;

        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    clearLogs() {
        const logContent = document.getElementById('log-content');
        if (logContent) {
            logContent.innerHTML = '';
        }
    }

    toggleLogPanel() {
        const logPanel = document.getElementById('log-panel');
        const toggleBtn = document.getElementById('toggle-logs');
        
        if (logPanel.style.maxHeight === '50px') {
            logPanel.style.maxHeight = '300px';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            logPanel.style.maxHeight = '50px';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.automationTaskManager = new AutomationTaskManager();
});
