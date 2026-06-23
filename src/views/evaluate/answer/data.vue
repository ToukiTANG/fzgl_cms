<template>
  <div class="paper-container">

    <el-card shadow="never" class="info-card">
      <template #header>
        <span>评议信息</span>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="评议事项">
          {{ order.evaluateName }}
        </el-descriptions-item>

        <el-descriptions-item label="被评议人">
          {{ order.evaluatedPersonName }}
        </el-descriptions-item>

        <el-descriptions-item label="部门">
          {{ order.evaluatedPersonDepartment }}
        </el-descriptions-item>

        <el-descriptions-item label="随机码">
          {{ receipt.randomCode }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="paper-card">

      <template #header>
        <span>评议内容</span>
      </template>

      <div
          v-for="(item,index) in order.items"
          :key="item.itemId"
          class="question-item"
      >

        <div class="question-title">
          {{ index + 1 }}. {{ item.title }}

          <el-tag
              v-if="item.required"
              type="danger"
              size="small"
              style="margin-left:10px"
          >
            必填
          </el-tag>
        </div>

        <!-- 单选 -->
        <div v-if="item.itemType === 0" class="option-list">

          <div
              v-for="option in item.options"
              :key="option.optionId"
              class="option-item"
              :class="{
                selected: answerMap[item.itemId] === option.optionCode
              }"
          >
            {{ option.optionCode }}.
            {{ option.optionContent }}
          </div>

        </div>

        <!-- 多选 -->
        <div v-else-if="item.itemType === 1" class="option-list">

          <div
              v-for="option in item.options"
              :key="option.optionId"
              class="option-item"
              :class="{
                selected: answerMap[item.itemId]?.split(',').includes(option.optionCode)
              }"
          >
            {{ option.optionCode }}.
            {{ option.optionContent }}
          </div>

        </div>

        <!-- 填空 -->
        <div v-else class="answer-text">

          {{ answerMap[item.itemId] || '未填写' }}

        </div>

      </div>

    </el-card>

  </div>
</template>

<script setup>
import {useRoute} from "vue-router";
import {receiptDetail} from "@/api/evaluate/answer/api.js";

const route = useRoute()
const order = reactive({

})

const receipt = reactive({
  answers: [
    {
      itemId: undefined,
      content: undefined,
    }
  ],
})

const answerMap = computed(() => {
  const map = {}

  receipt.answers?.forEach(answer => {
    map[answer.itemId] = answer.content
  })

  return map
})

function getAnswerDetail(receiptId) {
  receiptDetail(receiptId).then(res => {
    Object.assign(receipt, res.data.receipt)
    Object.assign(order, res.data.order)
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

getAnswerDetail(route.params.receiptId)
</script>

<style scoped lang="scss">
.paper-container {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.question-item {
  padding: 20px;
  margin-bottom: 20px;

  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.question-title {
  margin-bottom: 16px;

  font-size: 16px;
  font-weight: 600;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-item {
  padding: 8px 16px;

  border: 1px solid #dcdfe6;
  border-radius: 4px;

  background: #fff;
}

.option-item.selected {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;

  font-weight: 600;
}

.answer-text {
  padding: 12px;

  min-height: 60px;

  border: 1px solid #dcdfe6;
  border-radius: 4px;

  background: #fafafa;

  line-height: 1.8;
  white-space: pre-wrap;
}
</style>