// src/main/preloads/excel-review-preload.js
const { contextBridge, ipcRenderer } = require('electron');

function isValidChannel(channel) {
  // 白名单管控，限制允许的 channel
  const allowedChannels = [
    'dialog:openFile',
    'excel:start-validation',
    'excel:update-progress',
    'excel:error',
    'excel:done'
  ];
  return allowedChannels.includes(channel);
}

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => {
    if (!isValidChannel(channel)) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    return ipcRenderer.invoke(channel, data);
  },
  
  send: (channel, data) => {
    if (!isValidChannel(channel)) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    ipcRenderer.send(channel, data);
  },
  
  on: (channel, callback) => {
    if (!isValidChannel(channel)) {
      throw new Error(`Invalid channel: ${channel}`);
    }
    const listener = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, listener);
    
    // 返回取消订阅函数
    return () => ipcRenderer.removeListener(channel, listener);
  },

  // 便捷方法
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  startValidation: (payload) => ipcRenderer.invoke('excel:start-validation', payload),
});