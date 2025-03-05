import { ipcRenderer } from 'electron'

window.addEventListener('keyup', (e) => {
  let key = e.key.toLowerCase()
  //F12拦截，让开发模式下app，打开调试工具
  if (key == 'f12') {
    ipcRenderer.send('F12_PRESSED')
    return
  }
})
