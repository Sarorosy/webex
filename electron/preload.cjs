const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  notify: (message) => ipcRenderer.send("notify", message),
});
