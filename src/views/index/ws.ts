let timer = 0

function clearTimer() {
  if (timer > 0) clearTimeout(timer)
  timer = 0
}

export function connectWs(options: { url: string; timeout?: number }) {
  let { url, timeout = 3000 } = options
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(url)
    timer = setTimeout((ws: any) => {
      console.error("websocket连接超时，超时设定：", timeout)
      ws.close()
      timer = 0
    }, timeout, ws)


    ws.addEventListener('open', () => {
      console.debug(`到websocket：${url}的链接已建立`)
      clearTimer()
      resolve(ws)
    })

    ws.addEventListener('close', (e: any) => {
      console.debug(`websocket：${url}：close回调`)
      clearTimer()
      reject(e)
    })

    ws.addEventListener('error', (e: any) => {
      console.error(`websocket：${url}：error回调`, e)
      clearTimer()
      reject(e)
    })
  })
}
