const { app, BrowserWindow, ipcMain, Notification } = require("electron"); // ✅ This line must be at the top
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"), // ✅ Make sure this file exists
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173"); // ✅ Make sure Vite dev server is running
}

app.whenReady().then(() => {
  createWindow();

  // ✅ This will now work because ipcMain is defined at the top
  ipcMain.on("notify", (event, message) => {
    new Notification({ title: "Notification", body: message }).show();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
