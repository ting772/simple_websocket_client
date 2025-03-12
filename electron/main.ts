import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import log from 'electron-log/main';
import loggerConfig from '../src/canstant/loggerConfig'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const minWidth = 1100
const minHeight = 740
app.disableHardwareAcceleration();

function getAppPath() {
  return app.isPackaged ? path.dirname(app.getPath('exe')) : cwd()
}

(function () {
  //设置logs目录位置，dev模式下，项目根目录/logs，
  function setLogPath() {
    //@ts-ignore
    app.setAppLogsPath(path.join(getAppPath(), 'logs'))
  }

  setLogPath()

  log.initialize();

  for (let key in log.transports) {
    if (log.transports[key]) log.transports[key].level = false
  }

  loggerConfig.main.forEach(({ type, enable, ...others }) => {
    Object.assign(
      log.transports.file,
      others, type == 'file' ? {
        resolvePathFn: (obj) => {
          return path.join(app.getPath('logs'), obj.fileName)
        }
      } : null
    )
  })

  // log.eventLogger.startLogging()
  log.errorHandler.startCatching()
})()

function createMainWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // 确保 webSecurity 是启用的
    },
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    center: true,
    show: false
  })
  win.removeMenu()

  win.once('ready-to-show', () => {
    win.show()
  })

  //@ts-ignore
  if (!app.isPackaged) {
    ipcMain.on('F12_PRESSED', () => {
      let c = win.webContents
      if (!c.isDevToolsOpened()) {
        c.openDevTools()
      }
      else {
        c.closeDevTools()
      }
    })
  }

  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    //@ts-ignore  Load your file
    win.loadFile(path.join(import.meta.env.VITE_WEB_BUILD_DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    // 在 macOS 系统内, 如果没有已开启的应用窗口
    // 点击托盘图标时通常会重新创建一个新窗口
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
