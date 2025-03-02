<template>
  <el-select v-model="model" multiple filterable allow-create placeholder="输入过滤正则表达式" @change="selectChange"
    default-first-option :disabled="disabled" clearable collapse-tags :max-collapse-tags="4" collapse-tags-tooltip>
    <el-option v-for="(item, index) in list" :key="item" :label="item" :value="item">
      <div class="option-inner">
        <span>{{ item }}</span>
        <el-button style="margin-left:auto;" type="success" size="small" plain @click.stop="copy(item)">copy</el-button>
        <el-button style="margin-left:10px;" type="info" size="small" plain
          @click.stop="deleteUrl(index)">delete</el-button>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import usePersis from '@/hooks/usePersis'
import { WS_MSG_FILTER_REGS } from '@/canstant/storageKey'

const model = defineModel() as any
defineProps<{ disabled?: boolean }>()

const { data: list, persist } = usePersis<string[]>(WS_MSG_FILTER_REGS, [])

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

function selectChange(e: string[]) {
  let ret = [] as string[]
  e.forEach(str => {
    if (!list.value.includes(str)) {
      ret.push(str)
    }
  })
  list.value.push(...ret)
  persist(list.value)
}
</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}
</style>
