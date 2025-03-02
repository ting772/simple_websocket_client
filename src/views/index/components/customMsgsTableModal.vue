<template>
  <el-dialog v-model="model" title="自定义消息发送" width="900">
    <div style="display: flex;padding:10px;">
      <el-button style="margin-left:auto;" type="success" @click="createModalVisible = true">创建消息</el-button>
    </div>
    <el-table :data="list" empty-text="没有自定义消息" table-layout="auto">
      <el-table-column property="date" label="创建时间" width="150" />
      <el-table-column property="title" label="标题" width="200" />
      <el-table-column property="data" label="数据" />
      <el-table-column property="interval" label="循环定时器间隔(ms)" />
      <el-table-column property="enable" label="是否开启" />
    </el-table>
  </el-dialog>
  <create-msg-modal v-model="createModalVisible" @save="onCreateMsg"></create-msg-modal>
</template>

<script setup lang="ts">
import usePersis from '@/hooks/usePersis'
import { PREFIX_CUSTOM_SEND_MSG_CONFIG } from '@/canstant/storageKey'
import CreateMsgModal from './createMsg.vue'
import { GLOBAL_WEBSOCKET } from '@/canstant/provideKey'
import type { SAVED_CUSTOM_MSG_ITEM_TYPE, CUSTOM_MSG_ITEM_NEW_CREATED_TYPE } from '@/intefaface/main'

defineProps<{
  url: string;//查找或者设置对这个url地址对应的配置
}>()

//当前连接这的ws客户端
const ws = inject<ShallowRef<WebSocket>>(GLOBAL_WEBSOCKET)

if (ws) {
  watch(ws, (newV) => {
    console.log(newV)
  })
}

const model = defineModel() as any
const { data: list, persist } = usePersis<SAVED_CUSTOM_MSG_ITEM_TYPE[]>(PREFIX_CUSTOM_SEND_MSG_CONFIG, [])

const createModalVisible = ref(true)

function onCreateMsg(form: CUSTOM_MSG_ITEM_NEW_CREATED_TYPE) {
  console.log(form)
}
</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}
</style>
