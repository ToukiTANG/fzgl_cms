<template>
  <el-dialog :title="dialogTitle" v-model="addCodeVisible" append-to-body width="30%" @close="cancel">
    <el-form ref="addCodeForm" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="随机码个数" prop="codeNum">
        <el-input-number v-model="form.codeNum"/>
      </el-form-item>
      <el-form-item label="每个随机码可用次数" prop="codeCount">
        <el-input-number v-model="form.codeCount"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {publishOrder} from "@/api/evaluate/order/api.js";

const addCodeVisible = ref(false)
const dialogTitle = ref('')
const publishOrderId = ref('')
const {proxy} = getCurrentInstance()
const data = reactive({
  form: {
    codeNum: undefined,
    codeCount: undefined,
  },
  rules: {
    codeNum: [{required: true, message: "随机码个数不能为空", trigger: "blur"}],
    codeCount: [{required: true, message: "每个随机码可用次数不能为空", trigger: "blur"}],
  }
})
const {form, rules} = toRefs(data)
const emit = defineEmits(['success'])

function open(title, orderId) {
  publishOrderId.value = orderId
  addCodeVisible.value = true
  dialogTitle.value = title
}

defineExpose({
  open
})

/** 提交按钮 */
function submitForm() {
  proxy.$refs["addCodeForm"].validate(valid => {
    if (valid) {
      publishOrder(publishOrderId.value, form.value).then(res => {
        proxy.$modal.msgSuccess("发布成功")
        addCodeVisible.value = false
        emit('success')
      }).catch(err => {
        console.log('error', err)
      })
    }
  })
}

/** 取消按钮 */
function cancel() {
  addCodeVisible.value = false
}
</script>

<style scoped lang="scss">

</style>