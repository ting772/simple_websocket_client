

import log from 'electron-log/renderer';
import loggerConfig from '@/canstant/loggerConfig'

(function init() {
  try {
    //先关闭所有transport
    for (let key in log.transports) {
      let t = log.transports[key]
      if (t) {
        t.level = false
      }
    }

    //按配置打开特定的transport
    loggerConfig.render.filter(item => item.enable).forEach(({ type, level, format }) => {
      if (log.transports[type]) {
        Object.assign(log.transports[type], {
          level,
          format
        })
      }
    })
  } catch (e) {
    log.error('logger初始配置异常', e)
  }
})()

export default function createLogger(scoped: string, options?: {}) {
  let { } = options ?? {}

  //根据打包配置是否移除console.log,这里不用动态形式
  return {
    log: (...args: any[]) => {
      log.log(scoped, ...args)
    },
    debug: (...args: any[]) => {
      log.debug(scoped, ...args)
    },
    warn: (...args: any[]) => {
      log.warn(scoped, ...args)
    },
    error: (...args: any[]) => {
      log.error(scoped, ...args)
    }
  }
}
