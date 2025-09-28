// src/main/workers/excel-validation-worker.js
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

// 引入依赖库 - 需要在Electron项目中安装这些包
const XLSX = require('xlsx');
const JSZip = require('jszip');
const sharp = require('sharp');

// 消息类型
const MESSAGE_TYPES = {
  PROGRESS: 'progress',
  ERROR: 'error',
  DONE: 'done',
};

// 发送进度消息
function reportProgress(stage, message, progress = 0, data = null) {
  parentPort.postMessage({
    type: MESSAGE_TYPES.PROGRESS,
    stage,
    message,
    progress,
    data,
  });
}

// 发送错误消息
function reportError(message, error = null) {
  parentPort.postMessage({
    type: MESSAGE_TYPES.ERROR,
    message,
    error: error ? { message: error.message, stack: error.stack } : null,
  });
}

// 发送完成消息
function reportDone(result) {
  parentPort.postMessage({
    type: MESSAGE_TYPES.DONE,
    result,
  });
}

// 主验证函数
async function validateExcel(filePath, options = {}) {
  try {
    reportProgress('start', '开始验证Excel文件...', 5);

    // 读取文件
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileSizeMB = fileBuffer.length / 1024 / 1024;
    
    reportProgress('parse', `解析Excel文件 (${fileSizeMB.toFixed(2)}MB)...`, 10);

    // 解析Excel
    const workbook = XLSX.read(fileBuffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false,
      dense: false,
      sheetStubs: false,
      bookVBA: false,
      bookSheets: false,
      bookProps: false,
      bookFiles: false,
      bookDeps: false,
      raw: false,
    });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel文件中没有找到任何工作表');
    }

    reportProgress('sheets', '分析工作表...', 20, { 
      sheets: workbook.SheetNames 
    });

    // 获取第一个工作表进行验证（可以根据需要修改）
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet || !worksheet['!ref']) {
      throw new Error('工作表为空或无有效数据');
    }

    reportProgress('convert', '转换数据格式...', 30);

    // 转换为JSON格式
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });

    if (data.length === 0) {
      throw new Error('工作表为空');
    }

    reportProgress('validate', '验证数据...', 50);

    // 基本数据验证（这里是示例，您需要根据实际需求实现）
    const errors = [];
    const warnings = [];
    
    // 检查表头
    if (data.length > 0) {
      const headers = data[0];
      if (!headers || headers.length === 0) {
        errors.push({
          type: 'header',
          message: '缺少表头行',
          row: 1,
        });
      }
    }

    // 验证数据行
    for (let i = 1; i < Math.min(data.length, 1000); i++) { // 限制验证行数避免性能问题
      const row = data[i];
      if (!row || row.every(cell => !cell)) {
        continue; // 跳过空行
      }

      // 示例验证：检查是否有空单元格
      row.forEach((cell, cellIndex) => {
        if (!cell || String(cell).trim() === '') {
          warnings.push({
            type: 'empty_cell',
            message: '发现空单元格',
            row: i + 1,
            column: cellIndex + 1,
          });
        }
      });

      // 报告进度
      if (i % 100 === 0) {
        const progress = 50 + (i / data.length) * 30;
        reportProgress('validate', `验证数据行 ${i}/${data.length}...`, progress);
      }
    }

    // 图片验证（如果需要）
    let imageValidation = null;
    if (options.includeImages) {
      reportProgress('images', '开始图片验证...', 80);
      try {
        imageValidation = await validateImages(fileBuffer);
      } catch (imageError) {
        warnings.push({
          type: 'image_validation',
          message: '图片验证失败: ' + imageError.message,
        });
      }
    }

    reportProgress('complete', '验证完成...', 95);

    // 构建结果
    const result = {
      success: true,
      summary: {
        fileName: path.basename(filePath),
        fileSize: fileSizeMB,
        sheetName: firstSheetName,
        totalRows: data.length,
        totalColumns: data[0]?.length || 0,
        errorCount: errors.length,
        warningCount: warnings.length,
      },
      validation: {
        errors,
        warnings,
      },
      imageValidation,
    };

    reportDone(result);

  } catch (error) {
    console.error('Excel验证失败:', error);
    reportError('Excel验证失败: ' + error.message, error);
  }
}

// 图片验证函数（简化版本）
async function validateImages(fileBuffer) {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(fileBuffer);

    const images = [];
    const mediaFolder = zipContent.folder('xl/media');
    
    if (mediaFolder) {
      const imageFiles = [];
      mediaFolder.forEach((relativePath, file) => {
        if (!file.dir && /\.(png|jpg|jpeg|gif|bmp)$/i.test(file.name)) {
          imageFiles.push({ relativePath, file });
        }
      });

      for (let i = 0; i < Math.min(imageFiles.length, 50); i++) { // 限制处理图片数量
        const { relativePath, file } = imageFiles[i];
        
        try {
          const imageData = await file.async('uint8array');
          const buffer = Buffer.from(imageData);
          
          // 使用sharp分析图片
          const metadata = await sharp(buffer).metadata();
          
          // 简单的清晰度检测（基于图片尺寸和文件大小）
          const pixelCount = metadata.width * metadata.height;
          const bytesPerPixel = imageData.length / pixelCount;
          const isLowQuality = bytesPerPixel < 0.5 || metadata.width < 400 || metadata.height < 300;
          
          images.push({
            name: relativePath,
            width: metadata.width,
            height: metadata.height,
            size: imageData.length,
            format: metadata.format,
            isLowQuality,
          });
        } catch (imageError) {
          console.warn(`处理图片失败: ${relativePath}`, imageError);
        }
      }
    }

    return {
      totalImages: images.length,
      lowQualityCount: images.filter(img => img.isLowQuality).length,
      images: images.slice(0, 10), // 只返回前10张图片的详情
    };
  } catch (error) {
    throw new Error('图片验证失败: ' + error.message);
  }
}

// 主入口：从workerData获取参数并开始验证
if (workerData) {
  const { filePath, options } = workerData;
  
  if (!filePath) {
    reportError('缺少文件路径参数');
  } else {
    validateExcel(filePath, options)
      .catch(error => {
        console.error('Worker执行失败:', error);
        reportError('验证任务执行失败', error);
      });
  }
} else {
  reportError('缺少Worker数据');
}