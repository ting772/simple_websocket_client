let timer = 0

let id = 0
onmessage = (e) => {
  const { action, payload } = e.data
  switch (action) {
    case 'start':
      startTimer(payload.interval)
      break;

    case 'stop':
      stopTimer()
      break

    default:
      console.warn('timer webworker不支持的操作类型')
      break;
  }
};

function startTimer(iterval: number) {
  timer = setInterval(() => {
    postMessage(`${new Date().toLocaleTimeString()}#####${id++}`)
  }, iterval)
}

function stopTimer() {
  clearInterval(timer)
  timer = 0
}
