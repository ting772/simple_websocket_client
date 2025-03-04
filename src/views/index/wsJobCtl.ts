import { PREFIX_CUSTOM_MSGS } from '@/canstant/storageKey'
import type { SavedCustomMsgItemType } from '@/intefaface/main'
import { load } from '@/hooks/usePersis'
import createJobRunner from './jobRunner'
import createLogger from '@/utils/log'
import gConfig from '@/canstant/config'

type CustomMsgJob = {
  jobId: string;
  customMsg: SavedCustomMsgItemType,
  cancel: () => void
}

export default function createWsJobCtl() {

  let { debug: debugLog, error: errorLog, warn: warnLog, log } = createLogger('[wsJobController]1')
  let wsCacheMap = new Map<WebSocket, {
    url: string;
    jobs: CustomMsgJob[]
  }>()

  let jobRunner = createJobRunner({ interval: gConfig.customMsgIntervalStep })

  function _createJob(ws: WebSocket, item: SavedCustomMsgItemType) {
    let { id: jobId, interval, enable, data } = item
    if (interval > 0 && enable) {

      const cancelJob = jobRunner.appendIntervalJob(() => {
        try {

          /**
           * 如果服务器端关闭或者 主动调用close(clientWebsocket)的话，用户
           * 端调用send发送数据，不会走异常
           *
           * websocket.readyState取以下值
           *  0:套接字已创建，但连接尚未打开
           *  1:连接已打开，准备进行通信
           *  2:连接正在关闭中
           *  3:连接已关闭或无法打开
           */
          let d = new Date()
          let readyState = ws.readyState
          debugLog(`[job] ${d.toLocaleTimeString()} ws readyState：${readyState},url：${ws.url}`)
          if (readyState == 2 || readyState == 3) {
            warnLog(`[job]ws状态为异常状态，readyState：${readyState}，自动取消任务`)
            cancel()
            return
          }
          ws.send(data)
        } catch (err) {
          errorLog('[job]发送任务失败', err)
          cancel()
          return
        }
      }, interval)

      const cancel = () => {
        log('[job]取消任务', jobId)
        cancelJob()
      }

      return {
        jobId,
        customMsg: { ...item },
        cancel
      } as CustomMsgJob
    }
  }

  //缓存ws，url，及由自定义消息生成的任务
  function addWsClient(ws: WebSocket, url: string) {
    if (wsCacheMap.size > 0) {
      warnLog(`[addWsClient]ws缓存目前只支持一个缓存ws实例，当前数量：${wsCacheMap.size}`)
    }
    if (wsCacheMap.has(ws)) {
      warnLog('[addWsClient]检测到websocket实例重复，addWsClient调用失败')
      return
    }
    let jobs = [] as any[]
    wsCacheMap.set(ws, {
      url,
      jobs
    })

    //ws连接成功时自动执行本地已经定义好的消息重复发送任务
    let customMsgs = load<SavedCustomMsgItemType[]>(`${PREFIX_CUSTOM_MSGS}${url}`, [])

    //仅仅为 循环定时器时间间隔>0，并开启了的 自定义消息 生成自动执行的任务
    customMsgs.forEach(item => {
      let job = _createJob(ws, item)
      if (job) jobs.push(job)
    })

    log(`[addWsClient]为客户端${url}生成${jobs.length}个自动执行的任务`)
  }

  /**
   * 取消所有执行中的任务，并移除缓存
   * @param ws
   */
  function removeWsClient(ws: WebSocket) {
    let config = wsCacheMap.get(ws)
    if (config) {
      let { jobs } = config
      log(`[removeWsClient]移除websocket:${config.url}对应的客户端和缓存`, jobs.length > 0 ? `，并取消${jobs.length}个自动执行的任务` : '')
      jobs.forEach(job => {
        job.cancel()
      })
      wsCacheMap.delete(ws)
    }
  }

  /**
   * 仅取消jobId指定的任务，并移除该任务
   * @param ws
   * @param jobId
   * @param remove
   */
  function cancelJob(ws: WebSocket | undefined | null, jobId: string) {
    if (!ws) {
      log('[cancelJob]cancelJob传递ws为空')
      return
    }
    let config = wsCacheMap.get(ws)
    if (config) {
      let { jobs } = config
      let index = jobs.findIndex(item => item.jobId == jobId)
      if (index > -1) {
        jobs[index].cancel()
        jobs.splice(index, 1)
        log(`[cancelJob]移除任务${jobId}`)
      } else {
        log(`[cancelJob]缓存中未发现任务${jobId}`)
      }
    } else {
      log('[cancelJob]没有发现缓存')
    }
  }

  function updateCustomMsg(ws: WebSocket | undefined | null, url: string, item: SavedCustomMsgItemType) {
    if (!ws) {
      log('[updateCustomMsg]传递ws为空')
      return
    }

    let config = wsCacheMap.get(ws)
    if (!config) {
      log('[updateCustomMsg]无法为ws客户端找到缓存')
      return
    }

    if (config.url != url) {
      log('[updateCustomMsg]ws客户端缓存url与传入url不一致', `缓存url：${config.url}，传入url：${url}`)
      return
    }

    let { id } = item
    let jobInRunnig = config.jobs.find(item => item.jobId == id)

    //如果已有停止任务运行
    if (jobInRunnig) {
      log(`[updateCustomMsg]准备停止已运行的任务：${jobInRunnig.jobId}`)
      cancelJob(ws, jobInRunnig.jobId)
    }

    let newJob = _createJob(ws, item)
    if (newJob) {
      log(`[updateCustomMsg]启动任务：${newJob.jobId}`)
      config.jobs.push(newJob)
    }
  }

  function dispose() {
    if (wsCacheMap.size > 0) {
      for (let ws of wsCacheMap.keys()) {
        removeWsClient(ws)
      }
    }
    jobRunner.dispose()
  }

  return {
    addWsClient,
    removeWsClient,
    cancelJob,
    updateCustomMsg,
    dispose
  }
}
