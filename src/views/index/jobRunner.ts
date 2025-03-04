// 在生产构建中将会分离出 chunk
import Worker from './workers/timer?worker'
import gConfig from '@/canstant/config'
import createLogger from '@/utils/log'

type IntervalJob = {
  type: 'interval';
  interval: number;
  run: () => void;
  lastRunAt: number;
}
type Job = IntervalJob

class Timer {
  _timerWorker: any

  init(cb: (e: any) => void) {
    this._timerWorker = new Worker()
    this._timerWorker.onmessage = cb
  }
  start(interval = 500) {
    this._timerWorker.postMessage({ action: "start", payload: { interval } })
  }

  stop() {
    this._timerWorker.postMessage({ action: "stop" })
  }

  destroy() {
    this._timerWorker.terminate()
  }
}

export default function createJobRunner(options?: { debug?: boolean, autoStart?: boolean, interval?: number }) {
  let {
    debug = true,
    autoStart = true,
    interval = 500
  } = options ?? {}
  let list = [] as Job[]
  let started = false, timer: Timer | undefined

  const { debug: debugLog, log } = createLogger('[job runner]', { debug })

  function launchTimer() {
    let idleCounter = 0
    if (started && !timer) {
      log('全局定时器初始并启动')
      timer = new Timer()
      timer.init(() => {
        if (list.length == 0) {
          idleCounter++
          debugLog('定时器空转,当前空转次数：', idleCounter)
          if (idleCounter > gConfig.idlingMaxCount) {
            timer!.destroy()
            timer = undefined
            log('定时器销毁')
            return
          }
        } else {
          idleCounter = 0
          _runJobs()
        }
      });
      (timer as Timer).start(interval)
    }
  }

  function appendIntervalJob(run: () => void, interval: number) {
    let job = { type: 'interval' as const, run, interval, lastRunAt: 0 }
    list.push(job)
    launchTimer()
    return () => {
      cancelJob(job)
    }
  }

  function _runJobs() {
    let d = new Date()
    for (let job of list) {
      let { type, run, interval, lastRunAt } = job
      if (type != 'interval') {
        console.warn('暂时不支持interval外的job类型')
        continue
      }
      if (interval == 0) {
        console.warn('interval job不支持时间间隔为0')
        continue
      }
      if (lastRunAt == 0) {
        job.lastRunAt = +d
      }
      if (+d >= lastRunAt + interval) {
        try {
          run()
        } catch (err) {
          console.error(`job[${run.name ?? '-'}]执行异常`, err)
        }
      }
    }
  }

  function _resetIntervalJobLastRunAt() {
    list.forEach(item => {
      if (item.type == 'interval') {
        item.lastRunAt = 0
      }
    })
  }

  function start() {
    if (started) return
    log('启动')
    started = true
    if (list.length > 0) {
      launchTimer()
    }
  }

  function stop() {
    log('停止')
    started = false
    if (timer) timer.stop()
    _resetIntervalJobLastRunAt()
  }

  function dispose() {
    list = []
    started = false
    log('销毁')
    if (timer) timer.destroy()
  }

  function cancelJob(job: Job) {
    let index = list.findIndex(item => item == job)
    if (index > -1) {
      list.splice(index, 1)
    }
  }

  if (autoStart) {
    start()
  }

  return {
    start,
    stop,
    dispose,
    appendIntervalJob,
    cancelJob
  }
}
