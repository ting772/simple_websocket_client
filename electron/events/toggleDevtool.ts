import { ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'

export default function (win: BrowserWindow) {
  if (import.meta.env.DEV !== 'production') {
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
}
