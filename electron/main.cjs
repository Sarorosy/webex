const { app, BrowserWindow, ipcMain,screen , Notification } = require("electron"); // ✅ This line must be at the top
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

  ipcMain.on('notify', (_, { title, message }) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: 300,
    height: 100,
    x: width - 320,
    y: height - 120,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile(path.join(__dirname, 'public', 'notification.html'));
  win.once('ready-to-show', () => {
    win.webContents.send('notify-data', { title, message });
  });

  setTimeout(() => {
    if (!win.isDestroyed()) win.close();
  }, 5000); // auto-close after 5 seconds
});

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
