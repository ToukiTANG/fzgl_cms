<template>
  <el-dialog v-model="visible" width="80%">
    <div class="app-container">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>{{ order.evaluateName }} </span>
            <el-tag> 被评议人：{{ person.name }}</el-tag>
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
            <el-radio-group v-if="item.itemType === 0" v-model="answers[index].content"
                            class="question-content">
              <el-radio v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-radio>
            </el-radio-group>

            <!-- 多选 -->
            <el-checkbox-group v-else-if="item.itemType === 1" v-model="answers[index].content"
                               class="question-content">
              <el-checkbox v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 填空 -->
            <div v-else-if="item.itemType === 2" class="question-content">
              <el-input v-model="answers[index].content" type="textarea" :rows="3"
                        placeholder="请输入内容"/>
            </div>

            <!-- 打分 -->
            <div class="number-range question-content" v-else-if="item.itemType === 3">
              <span class="range-text">最小：{{item.minValue}}</span>
              <el-input-number v-model="answers[index].content" :min="item.minValue" :max="item.maxValue"/>
              <span class="range-text">最大：{{item.maxValue}}</span>
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
const {proxy} = getCurrentInstance()

const emit = defineEmits(["success"])

const visible = ref(false)

const order = ref({})
const person = ref({})

/**
 * 页面答题数据
 *
 * content:
 * 单选 String
 * 多选 String[]
 * 问答 String
 * 打分 Number
 */
const answers = ref([])

/**
 * 打开窗口
 */
function open(orderData, personData) {
  order.value = orderData
  person.value = personData

  initAnswers()

  visible.value = true
}

defineExpose({
  open
})

/**
 * 初始化答案
 */
function initAnswers() {

  answers.value = order.value.items.map(item => {

    const oldAnswer = person.value.answers?.find(
        a => a.itemId === item.itemId
    )

    let content

    if (!oldAnswer) {

      switch (item.itemType) {

        case 1: // 多选
          content = []
          break

        case 3: // 打分
          content = null
          break

        default:
          content = ""
      }

    } else {

      switch (item.itemType) {

        case 1:
          content = oldAnswer.content
              ? oldAnswer.content.split(",")
              : []
          break

        case 3:
          content =
              oldAnswer.content === ""
                  ? null
                  : Number(oldAnswer.content)
          break

        default:
          content = oldAnswer.content
      }

    }

    return {
      recordId: oldAnswer?.recordId ?? null,
      itemId: item.itemId,
      itemType: item.itemType,
      content
    }

  })
}

/**
 * 校验
 */
function validateAnswers() {

  for (let i = 0; i < order.value.items.length; i++) {

    const item = order.value.items[i]
    const answer = answers.value[i].content

    if (!item.required) {
      continue
    }

    switch (item.itemType) {

      case 0:

        if (!answer) {
          proxy.$modal.msgError(`第${i + 1}题未作答`)
          return false
        }

        break

      case 1:

        if (answer.length === 0) {
          proxy.$modal.msgError(`第${i + 1}题未作答`)
          return false
        }

        break

      case 2:

        if (!answer.trim()) {
          proxy.$modal.msgError(`第${i + 1}题未作答`)
          return false
        }

        break

      case 3:

        if (answer == null) {
          proxy.$modal.msgError(`第${i + 1}题未作答`)
          return false
        }

        break
    }

  }

  return true
}

/**
 * 提交
 */
function submitForm() {

  if (!validateAnswers()) {
    return
  }

  person.value.personStatus = true

  person.value.answers = answers.value.map(answer => ({

    recordId: answer.recordId,

    itemId: answer.itemId,

    itemType: answer.itemType,

    personId: person.value.personId,

    content: Array.isArray(answer.content)
        ? answer.content.join(",")
        : String(answer.content ?? "")

  }))

  emit("success", person.value)

  visible.value = false
}

/**
 * 返回
 */
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

.number-range {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.range-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>