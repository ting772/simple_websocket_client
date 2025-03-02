<template>
  <el-select v-model="model" filterable allow-create placeholder="选择或者输入一个ws服务器地址" style="width: 800px;"
    @change="selectChange" default-first-option :disabled="disabled" clearable>
    <el-option v-for="(item, index) in list" :key="item" :label="item" :value="item">
      <div class="option-inner">
        <span>{{ item }}</span>
        <el-button style="margin-left:auto;" type="success" size="small" plain @click.stop="copy(item)">copy</el-button>
        <el-button style="margin-left:10px;" type="info" size="small" plain
          @click.stop="deleteUrl(index)">delete</el-button>
        <el-button circle :icon="Message" type="primary" size="small" plain
          @click="$emit('showCustomMsgsTable', item)"></el-button>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import usePersis from '@/hooks/usePersis'
import { Message } from '@element-plus/icons-vue'
import { USED_WS_SERVER_HISTORY } from '@/canstant/storageKey'

const model = defineModel() as any
defineProps<{ disabled?: boolean }>()
defineEmits<{
  (e: 'showCustomMsgsTable', url: string): void
}>()

const { data: list, persist } = usePersis<string[]>(USED_WS_SERVER_HISTORY, [])
model.value = list.value[0] || ''

function copy(url: string) {
  try {
    navigator.clipboard.writeText(url)
  } catch (err) {
    ElMessage.error('复制失败')
    return
  }
  ElMessage.success('复制成功')
}

function deleteUrl(index: number) {
  list.value.splice(index, 1)
  persist(list.value)
}

function selectChange(e: string) {
  //clearable：true导致清除后selectChange调用传入undefined
  if (typeof e != 'string' || e === '') return
  if (!list.value.includes(e)) {
    list.value.push(e)
    persist(list.value)
  }
}
</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}
</style>
