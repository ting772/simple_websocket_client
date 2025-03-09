<template>
  <el-dialog v-model="model" title="发送消息" width="900">
    <el-input :rows="20" type="textarea" v-model="msg" placeholder="请输入发送的数据" clearable ref="inputRef" />
    <template #footer>
      <el-button type="success" @click="toSend">发送</el-button>
      <el-button type="info" @click="model = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

const model = defineModel() as any
const emit = defineEmits<{
  (e: 'send', msg: string, ctx: { clear: () => void; close: () => void; }): void
}>()

const props = defineProps<{
  msg?: string;
}>()

defineExpose({
  openModal,
  closeModal,
  clearInput
})

const msg = ref('')
function toSend() {
  if (msg.value === '') return
  emit('send', msg.value, { clear: clearInput, close: closeModal })
}

function openModal(str?: string) {
  imperative = true
  model.value = true
  msg.value = str ?? ''
}

function closeModal() {
  model.value = false
}

function clearInput() {
  msg.value = ''
}

let imperative = false

watch(() => props.msg, (newV) => {
  msg.value = newV ?? ''
})

watch(model, (open) => {
  if (!open) {
    imperative = false
    clearInput()
  } else if (!imperative) {
    msg.value = props.msg ?? ''
  }
})

watchEffect(() => {
  if (model.value) {
    setTimeout(() => {
      inputRef.value.focus()
    }, 0)
  }
})

const inputRef = ref()
</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}
</style>
