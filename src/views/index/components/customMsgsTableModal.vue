<template>
  <el-dialog v-model="model" title="自定义消息发送" width="80%" style="min-width: 1100px;">
    <div style="display: flex;padding:10px;">
      <el-button style="margin-left:auto;" type="success" @click="EditModalVisible = true">创建消息</el-button>
    </div>
    <el-table :data="list" empty-text="没有自定义消息" align="right" :height="500" style="min-width: 1000px;">
      <el-table-column property="created_at" label="创建时间" />
      <el-table-column property="updated_at" label="修改时间" />
      <el-table-column property="title" label="标题" width="200" class-name="title-col" />
      <el-table-column property="data" label="数据" min-width="200" class-name="data-col" />
      <el-table-column property="interval" label="循环定时器间隔(ms)" />
      <el-table-column property="enable" label="是否开启循环定时器间隔">
        <template v-slot="{ row }">
          <el-tooltip effect="dark" content="开启时，当连接ws服务器时自动开启循环定时器发送消息，关闭时销毁定时器" placement="top-start"
            :hide-after="100">
            <el-switch v-model="row.enable" @change="() => onUpdateMsg(row)" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" resizable min-width="150">
        <template v-slot="{ row }">
          <el-space>
            <el-tooltip v-if="ws" effect="dark" content="手动发送一次消息" placement="top" :hide-after="100">
              <el-button type="primary" size="small" @click="$emit('sendMsg', row.data)">发送</el-button>
            </el-tooltip>
            <el-button type="primary" size="small" @click="toEdit(row)">修改</el-button>
            <el-button type="danger" size="small" @click="remove(row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <create-msg-modal v-model="EditModalVisible" @create="onCreateMsg" :form="editForm"
    @update="onUpdateMsg"></create-msg-modal>
</template>

<script setup lang="ts">
import usePersis from '@/hooks/usePersis'
import { PREFIX_CUSTOM_MSGS } from '@/canstant/storageKey'
import CreateMsgModal from './createMsgModal.vue'
import { GLOBAL_WEBSOCKET } from '@/canstant/provideKey'
import type { SavedCustomMsgItemType, CustomMsgItemCreateType, } from '@/intefaface/main'
import { nanoid } from 'nanoid'

const props = defineProps<{
  url: string;//查找或者设置对这个url地址对应的配置
}>()

const key = computed(() => `${PREFIX_CUSTOM_MSGS}${props.url}`)
const emit = defineEmits<{
  (e: 'updateCustomMsgs', updateType: 'update', url: string, item: SavedCustomMsgItemType): void;
  (e: 'updateCustomMsgs', updateType: 'create', url: string, item: SavedCustomMsgItemType): void;
  (e: 'updateCustomMsgs', updateType: 'remove', url: string, id: string): void,
  (e: 'sendMsg', initial: string): void
}>()

//key变更清空列表
watch(key, (v) => {
  updateKey(v)
  reload(([]))
}, { flush: 'sync' })

const model = defineModel() as any

//初始时组件爱你没有url，这里只是占位作用
const { data: list, persist, updateKey, reload } = usePersis<SavedCustomMsgItemType[]>(key.value, [])

type InjectWebSocket = ShallowRef<WebSocket | undefined>

//当前连接的ws客户端
const ws = inject<InjectWebSocket>(GLOBAL_WEBSOCKET)!

const EditModalVisible = ref(false)
const editForm = ref<SavedCustomMsgItemType | null>()

function onCreateMsg(form: CustomMsgItemCreateType) {
  let d = new Date()
  let t = `${d.toLocaleDateString().replace(/(\\|\/)/g, ('-'))} ${d.toLocaleTimeString()}`
  let item = {
    id: nanoid(15),//生成伪随机id，作为本地唯一判断
    created_at: t,
    updated_at: t,
    ...form
  }
  list.value.push(item)
  persist(list.value)
  emit('updateCustomMsgs', 'create', props.url, item)
}

function onUpdateMsg(item: SavedCustomMsgItemType) {
  let index = list.value.findIndex(customMsg => customMsg.id == item.id)
  if (index == -1) return
  list.value[index] = item
  persist(list.value)
  emit('updateCustomMsgs', 'update', props.url, item)
}

function remove(item: SavedCustomMsgItemType) {
  let index = list.value.findIndex(customMsg => customMsg.id == item.id)
  if (index == -1) return
  list.value.splice(index, 1)
  persist(list.value)
  emit('updateCustomMsgs', 'remove', props.url, item.id)
}

watch(EditModalVisible, (open) => {
  if (!open && editForm.value) {
    editForm.value = null
  }
})

function toEdit(item: SavedCustomMsgItemType) {
  editForm.value = item
  EditModalVisible.value = true
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
