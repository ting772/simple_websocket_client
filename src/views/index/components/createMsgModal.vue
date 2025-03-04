<template>
  <el-dialog v-model="model" title="创建自定义消息" width="900">
    <el-form ref="formRef" style="max-width: 600px" :model="form" label-width="auto" :rules="rules">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" type="text" :maxlength="50" placeholder="请输入标题" clearable />
      </el-form-item>
      <el-form-item label="发送数据" prop="data" required>
        <el-input :autosize="{ minRows: 5, maxRows: 15 }" type="textarea" v-model="form.data" placeholder="请输入发送的数据"
          clearable />
      </el-form-item>
      <el-form-item label="循环定时器运行间隔" prop="interval" style="align-items: center;">
        <el-input-number v-model="form.interval" :min="0" :step="500" step-strictly />
      </el-form-item>
      <el-form-item label="是否开启" prop="enable" style="align-items: center;">
        <el-switch v-model="form.enable" size="large" active-text="开启" inactive-text="关闭" />
      </el-form-item>

    </el-form>
    <template #footer>
      <el-button type="success" @click="submit" :loading="submitting">保存</el-button>
      <el-button type="info" @click="model = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { CustomMsgItemCreateType, SavedCustomMsgItemType } from '@/intefaface/main'
import type { FormInstance } from 'element-plus';

const emit = defineEmits<{
  (e: "create", data: CustomMsgItemCreateType): void;
  (e: "update", data: SavedCustomMsgItemType): void
}>()

const props = defineProps<{
  form: SavedCustomMsgItemType | undefined | null
}>()

const model = defineModel() as any
const formRef = ref<FormInstance>()

function getInitialForm() {
  return {
    title: "",
    data: "",
    enable: false,
    interval: 0
  }
}
const form = ref<CustomMsgItemCreateType>(getInitialForm())

//编辑模式下，填写已有的字段
watch([model, () => props.form], ([visible, editForm]) => {
  if (visible && editForm) {
    form.value = Object.assign(form.value, editForm)
  }
})

//关闭窗口置空
watch(model, (newV) => {
  if (!newV) {
    form.value = getInitialForm()
    formRef.value?.resetFields()
  }
})

const rules = ref({
  data: [
    {
      required: true,
      message: '请输入要发送的消息',
    }
  ]
})

const submitting = ref(false)

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await formRef.value?.validate()
  } catch (err) {
    return
  } finally {
    submitting.value = false
  }

  if (props.form) {
    emit('update', { ...props.form, ...form.value })
  } else {
    emit('create', { ...form.value })
  }

  model.value = false
}

</script>
<style scoped>
.option-inner {
  display: flex;
  align-items: center;
}
</style>
