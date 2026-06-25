<template>
  <el-dialog v-model="visible" width="80%">
    <div class="app-container">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>{{ order.evaluateName }} </span>
            <el-tag> {{ person.name }}</el-tag>
          </div>
        </template>
        <div class="question-area">

          <!-- 动态渲染题目 -->
          <div v-for="(item,index) in order.items" :key="item.itemId" class="question-item">

            <!-- 题目 -->
            <div class="question-title">

              <span class="question-no">{{ index + 1 }}.</span><span>{{ item.title }}</span>
              <el-tag v-if="item.required" type="danger" size="small" style="margin-left: 10px">必填</el-tag>
            </div>

            <!-- 单选 -->
            <el-radio-group v-if="item.itemType === 0" v-model="answerForm.answers[item.itemId]" class="question-content">
              <el-radio v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-radio>
            </el-radio-group>

            <!-- 多选 -->
            <el-checkbox-group v-else-if="item.itemType === 1" v-model="answerForm.answers[item.itemId]"
                               class="question-content">
              <el-checkbox v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 填空 -->
            <div v-else-if="item.itemType === 2" class="question-content">
              <el-input v-model="answerForm.answers[item.itemId]" type="textarea" :rows="3" placeholder="请输入内容"/>
            </div>

            <!-- 打分 -->
            <div v-else-if="item.itemType === 3" class="question-content">
            <el-input-number v-model="answerForm.answers[item.itemId]" :min="0" :max="100"/>
            </div>

          </div>

        </div>

        <div class="footer-btn">
          <el-button @click="goBack"> 返回</el-button>
          <el-button type="primary" @click="submitForm"> 提交评议</el-button>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup>

const emit = defineEmits(['success'])
const visible = ref(false)
const formRef = ref()
const order = ref({})
const person = ref({})
const answerForm = reactive({
  answers: {}
})

function open(orderData, personData) {
  order.value = orderData
  person.value = personData
  visible.value = true
}

defineExpose({
  open
})

function submitForm() {

}

/**
 * 建立答案
 */
function buildRecords() {
  return order.value.items.map(item => ({
    recordId: null,
    itemId: item.itemId,
    content: Array.isArray(answerForm.answers[item.itemId])
        ? answerForm.answers[item.itemId].join(",")
        : answerForm.answers[item.itemId]
  }))
}
/*验证答案必填项*/
function validateAnswers() {

  for (let i = 0; i < order.value.items.length; i++) {

    const item = order.value.items[i]

    if (!item.required) {
      continue
    }

    const answer = answerForm.answers[item.itemId]

    if (item.itemType === 0 && !answer) {
      proxy.$modal.msgError(`第${i + 1}题未作答`)
      return false
    }

    if (item.itemType === 1 && (!answer || answer.length === 0)) {
      proxy.$modal.msgError(`第${i + 1}题未作答`)
      return false
    }

    if (item.itemType === 2 && (!answer || !answer.trim())) {
      proxy.$modal.msgError(`第${i + 1}题未作答`)
      return false
    }
  }

  return true
}

function goBack() {
  visible.value = false
}
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer {
  margin-top: 30px;
  text-align: center;
}
.question-area {
  min-height: 400px;
  padding: 20px 0;
}

.footer-btn {
  margin-top: 24px;
  text-align: center;
}


/* 题目渲染*/
.question-item {
  padding: 20px;
  margin-bottom: 16px;

  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.question-title {
  margin-bottom: 16px;

  font-size: 16px;
  font-weight: 600;
}

.question-no {
  margin-right: 6px;
}

.question-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>