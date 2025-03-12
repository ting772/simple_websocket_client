let { VITE_DEBUG, VITE_LOG_TRANSPORT_FILE_ENABLE, VITE_LOG_TRANSPORT_FILE_LEVEL } = import.meta.env
let isDebug = VITE_DEBUG == 'true'
let enableFile = VITE_LOG_TRANSPORT_FILE_ENABLE == 'true'

const renderTransports = [
  {
    type: "console",
    enable: isDebug,
    format: "{h}:{i}:{s} {text}",
    level: "silly"
  },
  {
    type: "ipc",
    enable: enableFile,
    level: VITE_LOG_TRANSPORT_FILE_LEVEL
  }
]

const mainTransports = [
  {
    type: "console",
    enable: isDebug,
    format: "{h}:{i}:{s} {text}",
    level: "silly"
  },
  {
    type: 'file',
    enable: enableFile,
    sync: false,
    level: VITE_LOG_TRANSPORT_FILE_LEVEL,
    format: "[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}"
  }
]

export default {
  render: renderTransports.filter(item => item.enable),
  main: mainTransports.filter(item => item.enable)
}
