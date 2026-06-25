<template>
  <el-dialog :title="dialogTitle" v-model="addCodeVisible" append-to-body width="50%" @close="cancel">
    <el-form ref="addCodeForm" :model="form" label-width="150px">
      <el-form-item label="请输入随机码个数" prop="codeNum">
        <el-input-number v-model="form.codeNum" @change="codeNumChange" :min="0"/>
      </el-form-item>
      <div v-for="(item,index) in form.codes" :key="index" class="code-card">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="随机码" :prop="`codes.${index}.code`"
                          :rules="[ {required: true, message: '随机码不能为空', trigger: 'blur' } ]">
              <el-input v-model="item.code" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="随机码可用次数" :prop="`codes.${index}.count`"
                          :rules="[ {required: true, message: '随机码可用次数不能为空', trigger: 'blur' } ]">
              <el-input-number v-model="item.count" :min="1"/>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
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
import {generateCode} from "@/utils/randomCode.js";

const addCodeVisible = ref(false)
const dialogTitle = ref('')
const publishOrderId = ref('')
const {proxy} = getCurrentInstance()
const data = reactive({
  form: {
    codeNum: 0,
    codes: []
  },
})
const {form} = toRefs(data)
const emit = defineEmits(['success'])

function open(title, orderId) {
  publishOrderId.value = orderId
  addCodeVisible.value = true
  dialogTitle.value = title
}

defineExpose({
  open
})

/** 随机码数量发生变化 */
function codeNumChange() {
  function createRow() {

    return {
      code: generateCode(6),
      count: 10
    }
  }

  const currentLength = form.value.codes.length
  if (form.value.codeNum > currentLength) {
    // 补足
    form.value.codes.push(
        ...Array.from(
            {length: form.value.codeNum - currentLength},
            createRow
        )
    )
  } else if (form.value.codeNum < currentLength) {
    // 截断
    form.value.codes.splice(form.value.codeNum)
  }
}

/** 提交按钮 */
function submitForm() {
  if (form.value.codes.length <= 0) {
    proxy.$modal.msgError("请点击生成随机码")
  }

  proxy.$refs["addCodeForm"].validate(valid => {
    if (valid) {
      publishOrder(publishOrderId.value, form.value.codes).then(res => {
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
  initForm()
}

function initForm() {
  form.value.codeNum = 0
  form.value.codes = []
}
</script>

<style scoped lang="scss">
.code-card {
  padding-top: 15px;
  margin-bottom: 12px;

  border: 1px dashed #dcdfe6;
  border-radius: 6px;

  transition: all .2s;
}

.code-card:hover {
  border-color: #409eff;
}
</style>