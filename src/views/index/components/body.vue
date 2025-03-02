<template>
  <el-card class="ws-container-body" body-class="ws-container-body-card-body">
    <el-scrollbar :min-size="20" always ref="refBody" height="100%" v-infinite-scroll="() => { }">
      <p v-for="item in list" :key="item.id">
        <el-text>{{ item.time }}</el-text>
        {{ item.data }}
      </p>
      <!-- <p v-for="item in 100">item -{{ item }}</p> -->
    </el-scrollbar>
  </el-card>

  <div style="position:fixed;bottom:200px;right:20px;">
    <el-button type="primary" plain circle size="large" @click="toTop">
      <el-icon :size="20">
        <Top />
      </el-icon>
    </el-button>
    <el-button type="primary" plain circle size="large" @click="toBottom">
      <el-icon :size="20">
        <Bottom />
      </el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Top, Bottom } from '@element-plus/icons-vue'

const props = defineProps<{
  list: any[]
}>()

const refBody = ref()

watch(() => props.list.length, (v) => {
  autoScroll()
})

function toTop() {
  refBody.value.setScrollTop(0)
}

function toBottom() {
  refBody.value.setScrollTop(refBody.value.wrapRef.scrollHeight)
}

function autoScroll() {
  let { scrollHeight, scrollTop, clientHeight } = refBody.value.wrapRef
  if (scrollTop + clientHeight >= scrollHeight) {
    nextTick(() => {
      toBottom()
    })
  }
}

</script>

<style scoped>
.ws-container-body {
  min-height: 1px;
  flex: 1;
  /* overflow: auto; */
}

:deep(.ws-container-body-card-body) {
  height: 100%;
  box-sizing: border-box;
  padding-bottom: 0;
  padding-right: 0;
}
</style>
