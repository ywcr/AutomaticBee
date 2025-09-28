// src/renderer/tools/excel-review/electron-adapter.js
// 这个脚本用于适配静态Next.js应用到Electron环境

(function() {
  'use strict';

  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElectronAdapter);
  } else {
    initElectronAdapter();
  }

  function initElectronAdapter() {
    console.log('Excel审核工具 - Electron适配器已启动');

    // 检查Electron API是否可用
    if (!window.electronAPI) {
      console.error('Electron API不可用，请检查preload脚本');
      showError('应用初始化失败：Electron API不可用');
      return;
    }

    // 创建文件上传和验证界面
    createUI();
    
    // 绑定事件监听器
    bindEventListeners();

    // 触发准备就绪事件
    window.dispatchEvent(new CustomEvent('electron-adapter-ready'));
  }

  function createUI() {
    // 清空现有内容
    document.body.innerHTML = '';
    
    // 创建主容器
    const container = document.createElement('div');
    container.style.cssText = `
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    `;

    // 创建标题
    const title = document.createElement('h1');
    title.textContent = 'Excel 审核工具';
    title.style.cssText = `
      text-align: center;
      color: white;
      margin-bottom: 2rem;
      font-size: 2.5rem;
      font-weight: 600;
    `;

    // 创建工具卡片
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    `;

    // 创建文件选择区域
    const fileArea = document.createElement('div');
    fileArea.id = 'file-area';
    fileArea.style.cssText = `
      border: 2px dashed #007bff;
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
      margin-bottom: 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    fileArea.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem; color: #007bff;">📊</div>
      <h3 style="margin-bottom: 0.5rem; color: #333;">点击选择Excel文件</h3>
      <p style="color: #666; margin: 0;">支持 .xlsx, .xlsm, .xlsb 格式</p>
    `;

    // 创建进度区域
    const progressArea = document.createElement('div');
    progressArea.id = 'progress-area';
    progressArea.style.cssText = `
      display: none;
      margin-bottom: 2rem;
    `;
    progressArea.innerHTML = `
      <h3 style="margin-bottom: 1rem; color: #333;">验证进度</h3>
      <div style="background: #f0f0f0; border-radius: 10px; overflow: hidden; margin-bottom: 1rem;">
        <div id="progress-bar" style="height: 10px; background: linear-gradient(90deg, #007bff, #0056b3); width: 0%; transition: width 0.3s ease;"></div>
      </div>
      <div id="progress-text" style="color: #666; font-size: 0.9rem;">准备开始...</div>
    `;

    // 创建结果区域
    const resultArea = document.createElement('div');
    resultArea.id = 'result-area';
    resultArea.style.cssText = `
      display: none;
      margin-top: 2rem;
    `;

    // 组装UI
    card.appendChild(fileArea);
    card.appendChild(progressArea);
    card.appendChild(resultArea);
    container.appendChild(title);
    container.appendChild(card);
    document.body.appendChild(container);

    // 添加hover效果
    fileArea.addEventListener('mouseenter', () => {
      fileArea.style.borderColor = '#0056b3';
      fileArea.style.backgroundColor = '#f8f9ff';
    });
    fileArea.addEventListener('mouseleave', () => {
      fileArea.style.borderColor = '#007bff';
      fileArea.style.backgroundColor = 'transparent';
    });
  }

  function bindEventListeners() {
    // 文件选择点击事件
    const fileArea = document.getElementById('file-area');
    if (fileArea) {
      fileArea.addEventListener('click', selectFile);
    }

    // 监听验证过程中的事件
    setupValidationListeners();
  }

  async function selectFile() {
    try {
      const filePath = await window.electronAPI.openFileDialog();
      if (filePath) {
        showSelectedFile(filePath);
        startValidation(filePath);
      }
    } catch (error) {
      console.error('文件选择失败:', error);
      showError('文件选择失败: ' + error.message);
    }
  }

  function showSelectedFile(filePath) {
    const fileArea = document.getElementById('file-area');
    const fileName = filePath.split(/[/\\]/).pop();
    
    fileArea.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 1rem; color: #28a745;">✅</div>
      <h3 style="margin-bottom: 0.5rem; color: #333;">已选择文件</h3>
      <p style="color: #666; margin: 0; word-break: break-all;">${fileName}</p>
      <button id="reselect-btn" style="
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
      ">重新选择</button>
    `;

    // 重新选择按钮事件
    const reselectBtn = document.getElementById('reselect-btn');
    if (reselectBtn) {
      reselectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        location.reload(); // 简单重置
      });
    }
  }

  async function startValidation(filePath) {
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');
    
    // 显示进度区域
    progressArea.style.display = 'block';
    resultArea.style.display = 'none';

    try {
      // 启动验证
      const result = await window.electronAPI.startValidation({ 
        filePath, 
        options: { includeImages: true } 
      });
      
      // 显示结果
      showResult(result);
    } catch (error) {
      console.error('验证失败:', error);
      showError('验证失败: ' + error.message);
    }
  }

  function setupValidationListeners() {
    // 监听进度更新
    const offProgress = window.electronAPI.on('excel:update-progress', (msg) => {
      updateProgress(msg.progress || 0, msg.message || '处理中...');
    });

    // 监听错误
    const offError = window.electronAPI.on('excel:error', (msg) => {
      console.error('验证错误:', msg);
      showError('验证过程中出错: ' + msg.message);
    });

    // 监听完成
    const offDone = window.electronAPI.on('excel:done', (result) => {
      console.log('验证完成:', result);
      showResult(result);
    });

    // 页面卸载时清理监听器
    window.addEventListener('beforeunload', () => {
      try {
        offProgress();
        offError();
        offDone();
      } catch (e) {
        console.warn('清理监听器失败:', e);
      }
    });
  }

  function updateProgress(progress, message) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
      progressBar.style.width = Math.max(0, Math.min(100, progress)) + '%';
    }
    
    if (progressText) {
      progressText.textContent = message;
    }
  }

  function showResult(result) {
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');
    
    // 隐藏进度，显示结果
    progressArea.style.display = 'none';
    resultArea.style.display = 'block';

    const summary = result.summary || {};
    const validation = result.validation || {};
    const imageValidation = result.imageValidation;

    resultArea.innerHTML = `
      <h3 style="color: #28a745; margin-bottom: 1.5rem;">✅ 验证完成</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
          <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${summary.totalRows || 0}</div>
          <div style="color: #666; font-size: 0.9rem;">总行数</div>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
          <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">${summary.totalColumns || 0}</div>
          <div style="color: #666; font-size: 0.9rem;">总列数</div>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
          <div style="font-size: 1.5rem; font-weight: bold; color: ${validation.errors?.length > 0 ? '#dc3545' : '#28a745'};">${validation.errors?.length || 0}</div>
          <div style="color: #666; font-size: 0.9rem;">错误数</div>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
          <div style="font-size: 1.5rem; font-weight: bold; color: ${validation.warnings?.length > 0 ? '#ffc107' : '#28a745'};">${validation.warnings?.length || 0}</div>
          <div style="color: #666; font-size: 0.9rem;">警告数</div>
        </div>
      </div>

      ${imageValidation ? `
        <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h4 style="color: #1976d2; margin-bottom: 1rem;">📷 图片验证结果</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div style="text-align: center;">
              <div style="font-size: 1.2rem; font-weight: bold; color: #1976d2;">${imageValidation.totalImages || 0}</div>
              <div style="color: #666; font-size: 0.8rem;">图片总数</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 1.2rem; font-weight: bold; color: ${imageValidation.lowQualityCount > 0 ? '#f57c00' : '#388e3c'};">${imageValidation.lowQualityCount || 0}</div>
              <div style="color: #666; font-size: 0.8rem;">低质量图片</div>
            </div>
          </div>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 2rem;">
        <button onclick="location.reload()" style="
          padding: 0.75rem 2rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
        ">验证新文件</button>
      </div>
    `;
  }

  function showError(message) {
    const progressArea = document.getElementById('progress-area');
    const resultArea = document.getElementById('result-area');
    
    // 隐藏进度
    if (progressArea) {
      progressArea.style.display = 'none';
    }
    
    // 显示错误
    if (resultArea) {
      resultArea.style.display = 'block';
      resultArea.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 1.5rem; border-radius: 8px; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
          <h3 style="margin-bottom: 1rem;">操作失败</h3>
          <p style="margin-bottom: 1.5rem; word-wrap: break-word;">${message}</p>
          <button onclick="location.reload()" style="
            padding: 0.75rem 2rem;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          ">重试</button>
        </div>
      `;
    } else {
      // 如果结果区域不存在，使用alert
      alert('错误: ' + message);
    }
  }

})();