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
            <el-radio-group v-if="item.itemType === 0" v-model="answers[index].content"
                            class="question-content" disabled>
              <el-radio v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-radio>
            </el-radio-group>

            <!-- 多选 -->
            <el-checkbox-group v-else-if="item.itemType === 1" v-model="answers[index].content"
                               class="question-content" disabled>
              <el-checkbox v-for="option in item.options" :key="option.optionId" :value="option.optionCode">
                {{ option.optionCode }}.
                {{ option.optionContent }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 填空 -->
            <div v-else-if="item.itemType === 2" class="question-content">
              <el-input v-model="answers[index].content" type="textarea" :rows="3"
                        placeholder="请输入内容" disabled/>
            </div>

            <!-- 打分 -->
            <div v-else-if="item.itemType === 3" class="question-content">
              <el-input-number v-model="answers[index].content" :min="0" :max="100" disabled/>
            </div>

          </div>

        </div>

        <div class="footer-btn">
          <el-button @click="goBack"> 返回</el-button>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup>

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
 * 初始化答案（回显）
 */
function initAnswers() {

  answers.value = order.value.items.map(item => {

    // 找到该题对应的答案
    const answer = person.value.answers?.find(
        a => a.itemId === item.itemId
    )

    let content

    if (!answer) {

      // 没有答案时初始化
      switch (item.itemType) {
        case 1:
          content = []
          break
        case 3:
          content = null
          break
        default:
          content = ""
      }

    } else {

      // 根据题型恢复数据类型
      switch (item.itemType) {

        case 1: // 多选
          content = answer.content
              ? answer.content.split(",")
              : []
          break

        case 3: // 打分
          content = answer.content === ""
              ? null
              : Number(answer.content)
          break

        default: // 单选、问答
          content = answer.content
      }

    }

    return {
      answerId: answer?.answerId ?? null,
      itemId: item.itemId,
      itemType: item.itemType,
      content
    }

  })
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
</style>