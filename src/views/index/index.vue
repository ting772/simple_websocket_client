<template>
  <div class="ws-conainer">
    <el-card>
      <el-space>
        <url-select :disabled="disabledSelect" v-model="url" @show-custom-msgs-table="showCustomMsgsTable"></url-select>
        <el-button v-bind="connectBtnConfig">{{ connectBtnConfig.value }}</el-button>
      </el-space>
      <div style="padding:10px 0;">
        <el-space>
          <filter-select v-model="filters" style="width:400px;"></filter-select>
          <el-text type="primary">总计：{{ total }}条</el-text>
          <el-text style="margin-left:10px;" type="success">过滤后：{{ filteredMsgs.length }}条</el-text>
          <el-button type="warning" @click="emptyList">清空消息</el-button>
          <el-button v-if="ws" circle :icon="Message" type="primary" size="small" plain
            @click="showCustomMsgsTable(url)"></el-button>
        </el-space>
      </div>
    </el-card>

    <Body :list="filteredMsgs"></Body>
    <custom-msgs-table-modal v-model="customMsgsTableModalVisible"
      :url="customMsgsTableModalWsUrl"></custom-msgs-table-modal>
  </div>
</template>

<script setup lang="ts">
import { connectWs } from './ws'
import Body from './components/body.vue'
import { Message } from '@element-plus/icons-vue'
import UrlSelect from './components/wsUrlSelect.vue'
import FilterSelect from './components/filterSelect.vue'
import CustomMsgsTableModal from './components/customMsgsTableModal.vue'
import { GLOBAL_WEBSOCKET } from '@/canstant/provideKey'
import { load } from '@/hooks/usePersis'
import { PREFIX_CUSTOM_MSGS } from '@/canstant/storageKey'
import type { SAVED_CUSTOM_MSG_ITEM_TYPE } from '@/intefaface/main'

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.debug('hot dispose callback')
    if (ws.value) ws.value.close()
  })
}

let total = ref(0)

type Msg = {
  id: number;
  time: string;
  data: string;
}

const regMap = new Map<string, RegExp>()

let msgs = [] as Msg[]
const url = ref('')
const filters = ref<string[]>([])
const filteredMsgs = ref<Msg[]>([])

const STATE = {
  IDLE: 0,
  CONNECTTING: 1,
  CONNECTTED: 2,
}

watch(filters, (newV) => {
  //如果没有过滤条件，则展示全部
  if (newV.length == 0) {
    filteredMsgs.value = [...msgs]
    return
  }

  let filter = createFilter()

  console.time('全量更新耗时')
  //正则表达式更新，则全量更新列表
  filteredMsgs.value = msgs.reduce((acc, item) => {
    let pass = filter(item)
    if (pass) acc.push(item)
    return acc
  }, [] as Msg[])
  console.timeEnd('全量更新耗时')
})

function createFilter() {
  let regs = [] as RegExp[]

  //获取到对应的正则表达式
  filters.value.forEach((str) => {
    let reg = regMap.get(str)
    if (!reg) {
      reg = new RegExp(str)
      regMap.set(str, reg)
    }
    regs.push(reg)
  })

  return function filter(msg: Msg) {
    return regs.every(reg => reg.test(msg.data))
  }
}

function emptyList() {
  msgs = []
  filteredMsgs.value = []
  total.value = 0
}

const state = ref(STATE.IDLE)
let ws = shallowRef<WebSocket>()
provide(GLOBAL_WEBSOCKET, ws)

const connectBtnConfig = computed(() => {
  return {
    loading: state.value == STATE.CONNECTTING,
    value: {
      [STATE.IDLE]: '连接',
      [STATE.CONNECTTING]: '连接中',
      [STATE.CONNECTTED]: '断开连接'
    }[state.value],
    disabled: disabledConnectBtn(url.value) || false,
    type: state.value == STATE.CONNECTTED ? ('primary' as const) : ('success' as const),
    onClick: {
      [STATE.IDLE]: connect,
      [STATE.CONNECTTING]: () => { },
      [STATE.CONNECTTED]: disconnect
    }[state.value]
  }
})

const disabledSelect = computed(() => {
  return state.value == STATE.CONNECTTING || state.value == STATE.CONNECTTED
})

function disabledConnectBtn(url: string) {
  if (url === '') return true
  if (!/^ws{1,2}:\/\/.+/.test(url)) {
    return true
  }
}

watch(state, (newV, oldV) => {
  switch (newV) {
    case STATE.CONNECTTED:
      ElMessage.success('连接成功')
      break;

    case STATE.IDLE:
      if (oldV == STATE.CONNECTTING) {
        ElMessage.warning('连接失败')
      } else if (oldV == STATE.CONNECTTED) {
        ElMessage.success('断开连接')
      }
      break
  }
})

let id = 1
let wsCacheMap = new Map<WebSocket, {
  url: string;
  jobs: any[]
}>()


async function connect() {
  if (state.value !== STATE.IDLE) return
  state.value = STATE.CONNECTTING
  try {
    ws.value = await connectWs({ url: url.value })
  } catch (err) {
    state.value = STATE.IDLE
    return
  }
  state.value = STATE.CONNECTTED

  ws.value.addEventListener('message', function (this: any, e: any) {
    let d = new Date()
    let msg = markRaw({
      id: id++,
      time: `${d.toLocaleDateString().replace(/\//g, '-')} ${d.toLocaleTimeString()}`,
      data: e.data
    })
    msgs.push(msg)
    total.value = msgs.length
    //增量更新
    const filter = createFilter()
    if (filter(msg)) {
      filteredMsgs.value.push(msg)
    }
  })

  ws.value.addEventListener('close', function () {
    state.value = STATE.IDLE
    ws.value = undefined
  })

  let jobs = [] as any[]
  wsCacheMap.set(ws.value, {
    url: url.value,
    jobs
  })

  //ws连接成功时自动执行本地已经定义好的消息重复发送任务
  let customMsgs = load<SAVED_CUSTOM_MSG_ITEM_TYPE[]>(`${PREFIX_CUSTOM_MSGS}${url.value}`, [])
  customMsgs.forEach(item => {
    let { id: jobId, interval, enable, data } = item
    if (interval > 0 && enable) {

      let timer = setInterval((websocket: WebSocket) => {
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
          console.debug(`ws状态-${websocket.readyState},url：${websocket.url}`)
          if (websocket.readyState == 2 || websocket.readyState == 3) {
            console.debug(`检测到ws状态为异常状态，readyState：${websocket.readyState}，自动取消任务`)
            cancel(websocket)
            return
          }
          websocket.send(data)
        } catch (err) {
          console.error('重复发送任务失败', err)
        }
      }, interval, ws.value)

      const cancel = (websocket: WebSocket) => {
        clearInterval(timer)
        let config = wsCacheMap.get(websocket)
        if (config) {
          let index = 0
          for (let job of config.jobs) {
            if (job.jobId == jobId) {
              config.jobs.splice(index, 1)
              break
            }
            index++
          }
        }
        console.debug('取消循环任务', jobId)
      }
      jobs.push({
        jobId,
        cancel
      })
    }
  })
}

function disconnect() {
  if (!ws.value) return
  try {
    ws.value.close()
  } catch (err) {
    ElMessage.error('断开连接异常')
    console.error(err)
  }
}

const customMsgsTableModalVisible = ref(false)
const customMsgsTableModalWsUrl = ref('')

function showCustomMsgsTable(url: string) {
  customMsgsTableModalVisible.value = true
  customMsgsTableModalWsUrl.value = url
}


watch([ws], ([ws], [oldWs]) => {
  //ws关闭了
  if (ws == undefined && oldWs) {
    let config = wsCacheMap.get(oldWs)
    if (config) {
      let { jobs } = config
      jobs.forEach(job => {
        job.cancel(oldWs)
      })
    }
  }
})

</script>

<style scoped>
.ws-conainer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.option-inner {
  display: flex;
  align-items: center;
}
</style>
