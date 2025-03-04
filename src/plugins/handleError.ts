import type { App } from "vue"

export default function (app: App, options: {}) {
  let old = app.config.errorHandler
  app.config.errorHandler = function (err: unknown, instance: any, info: string) {
    if (old) {
      try {
        old.call(this, err, instance, info)
      } catch (err) {
        console.error("app.config.errorHandler调用异常", err)
      }
    }
    console.error('vue全局异常处理器：', err, '，来源：', info)
  }

  function handle(error: any) {
    console.error('全局异常处理器：', error)
  }

  window.addEventListener('error', handle)

  app.onUnmount(() => {
    window.removeEventListener('error', handle)
  })
}
