<template>
  <el-dialog v-model="model" title="自定义消息发送" width="80%">
    <div style="display: flex;padding:10px;">
      <el-button style="margin-left:auto;" type="success" @click="createModalVisible = true">创建消息</el-button>
    </div>
    <el-table :data="list" empty-text="没有自定义消息" align="right" :height="500">
      <el-table-column property="created_at" label="创建时间" />
      <el-table-column property="updated_at" label="修改时间" />
      <el-table-column property="title" label="标题" width="200" class-name="title-col" />
      <el-table-column property="data" label="数据" min-width="200" class-name="data-col" />
      <el-table-column property="interval" label="循环定时器间隔(ms)" />
      <el-table-column property="enable" label="是否开启循环定时器间隔">
        <template v-slot="{ row }">
          <el-tooltip effect="dark" content="开启时，当连接ws服务器时自动开启循环定时器发送消息，关闭时销毁定时器" placement="top-start"
            :hide-after="100">
            <el-switch v-model="row.enable" @change="update" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column v-if="ws?.readyState == 1" label="手动发送">
        <template v-slot="{ row }">
          <el-tooltip effect="dark" content="手动发送一次消息" placement="top" :hide-after="100">
            <el-button type="primary">发送</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <create-msg-modal v-model="createModalVisible" @save="onCreateMsg"></create-msg-modal>
</template>

<script setup lang="ts">
import usePersis from '@/hooks/usePersis'
import { PREFIX_CUSTOM_MSGS } from '@/canstant/storageKey'
import CreateMsgModal from './createMsg.vue'
import { GLOBAL_WEBSOCKET } from '@/canstant/provideKey'
import type { SAVED_CUSTOM_MSG_ITEM_TYPE, CUSTOM_MSG_ITEM_NEW_CREATED_TYPE } from '@/intefaface/main'
import { nanoid } from 'nanoid'

const props = defineProps<{
  url: string;//查找或者设置对这个url地址对应的配置
}>()

const key = computed(() => `${PREFIX_CUSTOM_MSGS}${props.url}`)

//key变更清空列表
watch(key, (v) => {
  updateKey(v)
  reload(([]))
}, { flush: 'sync' })

const model = defineModel() as any

//初始时组件爱你没有url，这里只是占位作用
const { data: list, persist, updateKey, reload } = usePersis<SAVED_CUSTOM_MSG_ITEM_TYPE[]>(key.value, [])

type InjectWebSocket = ShallowRef<WebSocket | undefined>

//当前连接的ws客户端
const ws = inject<InjectWebSocket>(GLOBAL_WEBSOCKET)!

const createModalVisible = ref(false)

function onCreateMsg(form: CUSTOM_MSG_ITEM_NEW_CREATED_TYPE) {
  let d = new Date()
  let t = `${d.toLocaleDateString().replace(/(\\|\/)/g, ('-'))} ${d.toLocaleTimeString()}`
  list.value.push({
    id: nanoid(10),//生成伪随机id，作为本地唯一判断
    created_at: t,
    updated_at: t,
    ...form
  })
  persist(list.value)
}

function update() {
  persist(list.value)
}
</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}

:deep(.title-col .cell),
:deep(.data-col .cell) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.title-col .cell) {
  line-clamp: 3;
  -webkit-line-clamp: 3;
}

:deep(.data-col .cell) {
  line-clamp: 3;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
</style>
