import type { App } from "vue"
import createLogger from '@/utils/log'

let logger = createLogger("[render process error]")

function stringifyErrorEvt(err: ErrorEvent) {
  let keys = ["filename", "lineno", "colno", "error", "message"] as const
  return keys.reduce((acc, key) => {
    acc.push(`${key}:${err[key]}`)
    return acc
  }, [] as any).join('\t')
}

export default function (app: App, options: {}) {
  let old = app.config.errorHandler
  app.config.errorHandler = function (err: unknown, instance: any, info: string) {
    if (old) {
      try {
        old.call(this, err, instance, info)
      } catch (err) {
        logger.error("app.config.errorHandler调用异常", err)
      }
    }
    logger.error(`vue全局异常处理器:type:${info}\terror:${err}\t`)
  }

  function handle(err: ErrorEvent,) {
    logger.error(`全局异常处理器:${stringifyErrorEvt(err)}`)
  }

  window.addEventListener('error', handle)

  app.onUnmount(() => {
    window.removeEventListener('error', handle)
  })
}
