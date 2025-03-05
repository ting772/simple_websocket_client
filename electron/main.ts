import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import installDevtoolToggle from './events/toggleDevtool'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const minWidth = 1100
const minHeight = 740
app.disableHardwareAcceleration()

function createMainWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
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

  installDevtoolToggle(win)
  // You can use `process.env.VITE_DEV_SERVER_URL` when the vite command is called `serve`
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    // Load your file
    win.loadFile('dist/index.html');
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
