# 布局常量统一化改造总结

## 改造目标
创建统一的布局配置常量文件，避免在多个文件中硬编码尺寸参数。

## 创建的文件
- `src/main/config/LayoutConstants.js` - 统一的布局常量配置文件

## 修改的文件
1. **HeaderViewManager.js**
   - 移除内部的 `HEADER_HEIGHT` 常量定义
   - 从 `LayoutConstants` 导入 `HEADER_HEIGHT`
   - 移除模块导出中的 `HEADER_HEIGHT`

2. **TabManager.js** 
   - 更新导入，从 `LayoutConstants` 获取 `HEADER_HEIGHT`
   - 所有硬编码的40像素高度已使用 `HEADER_HEIGHT` 常量替换

3. **WindowFactory.js**
   - 导入所需的窗口尺寸常量（`MIN_WINDOW_WIDTH`, `MIN_WINDOW_HEIGHT`, `DEFAULT_WINDOW_WIDTH`, `DEFAULT_WINDOW_HEIGHT`）
   - 替换主窗口和工具窗口创建中的硬编码尺寸

## 布局常量定义

### 标题栏相关
- `HEADER_HEIGHT = 40` - 标题栏高度

### 窗口尺寸相关
- `MIN_WINDOW_WIDTH = 1200` - 窗口最小宽度
- `MIN_WINDOW_HEIGHT = 800` - 窗口最小高度  
- `DEFAULT_WINDOW_WIDTH = 1400` - 默认窗口宽度
- `DEFAULT_WINDOW_HEIGHT = 900` - 默认窗口高度

### 标签相关
- `TAB_MIN_WIDTH = 120` - 标签最小宽度
- `TAB_MAX_WIDTH = 240` - 标签最大宽度
- `TAB_HEIGHT = 32` - 标签高度

## 统一化效果
- 所有布局尺寸参数集中管理
- 修改尺寸时只需更新一个文件
- 提高代码可维护性
- 避免不一致的硬编码值

## 后续建议
如需调整任何布局尺寸，直接修改 `LayoutConstants.js` 文件中的相应常量即可。