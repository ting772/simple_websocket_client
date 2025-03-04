

export default function createLogger(scoped: string, options?: {
  debug?: boolean
}) {
  let { debug = true } = options ?? {}

  //根据打包配置是否移除console.log,这里不用动态形式
  return {
    log: (...args: any[]) => {
      if (debug) {
        console.log(scoped, ...args)
      }
    },
    debug: (...args: any[]) => {
      if (debug) {
        console.debug(scoped, ...args)
      }
    },
    warn: (...args: any[]) => {
      if (debug) {
        console.warn(scoped, ...args)
      }
    },
    error: (...args: any[]) => {
      if (debug) {
        console.error(scoped, ...args)
      }
    }
  }
}
