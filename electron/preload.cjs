const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld('electronAPI', {
  notify: (title, message) => ipcRenderer.send('notify', { title, message })
});
