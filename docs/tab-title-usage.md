# 标签自定义标题功能使用指南

## 功能说明

新增的标签自定义标题功能允许用户为任何标签设置自定义标题，并且可以随时清除恢复到页面原始标题。

## IPC 接口

### 1. 设置自定义标题

```javascript
// 设置标签自定义标题
const result = await window.electronAPI.invoke('tab-set-title', tabId, '我的自定义标题');
if (result.success) {
    console.log('标题设置成功');
} else {
    console.error('设置失败:', result.error);
}
```

### 2. 清除自定义标题

```javascript
// 清除自定义标题，恢复页面标题
const result = await window.electronAPI.invoke('tab-clear-custom-title', tabId);
if (result.success) {
    console.log('自定义标题已清除');
} else {
    console.error('清除失败:', result.error);
}
```

## 标题优先级

标题显示优先级（从高到低）：
1. **自定义标题** - 用户通过 `tab-set-title` 设置的标题
2. **账号标题** - 登录后的用户名
3. **页面标题** - 网页自身的标题

## 功能特性

- ✅ 自定义标题优先于页面标题显示
- ✅ 设置自定义标题后，页面标题变化不会影响显示
- ✅ 可以随时清除自定义标题，恢复页面标题自动更新
- ✅ 标题变化会自动更新窗口标题（如果是活动标签）
- ✅ 支持所有标签管理事件（tabUpdated、tabTitleChanged）

## 使用场景

1. **账号管理** - 为不同账号的标签设置易识别的自定义名称
2. **任务标记** - 为执行特定任务的标签设置进度或状态标记
3. **页面分类** - 为功能相似的页面设置统一的标题格式
4. **临时标记** - 为需要临时关注的标签设置醒目标题

## 实现细节

- 在 `TabManager` 中为每个标签添加了 `customTitle` 字段
- 修改了页面标题更新逻辑，存在自定义标题时不会被页面标题覆盖
- 扩展了 `TabIPCHandler` 添加了两个新的 IPC 处理器
- 所有标签信息返回都包含 `customTitle` 字段