<template>
  <div class="evaluate-container">

    <!-- 查询区域 -->
    <el-card shadow="never" class="search-card">
      <template #header>
        <span>评议事项</span>
      </template>
      <el-form ref="queryRef" :model="queryForm" :inline="true" :rules="queryRules">
        <el-form-item label="中间码" prop="intermediateCode">
          <el-input v-model="queryForm.intermediateCode" placeholder="请输入中间码" clearable style="width: 220px"
                    :disabled="loaded"/>
        </el-form-item>

        <el-form-item label="随机码" prop="randomCode">
          <el-input v-model="queryForm.randomCode" placeholder="请输入随机码" clearable style="width: 220px"
                    :disabled="loaded"/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadEvaluate" :disabled="loaded">加载评议</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 评议内容区域 -->
    <el-card shadow="never" class="content-card">
      <template #header>
        <span>评议内容</span>
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

        </div>

      </div>
    </el-card>
    <!-- 提交区域 -->
    <div class="footer-btn">
      <el-button type="primary" size="large" @click="submitEvaluate" :disabled="!loaded">提交评议</el-button>
    </div>

  </div>
</template>

<script setup>

import {evaluateContent, submitAnswer} from "@/api/evaluate/execution/api.js";

const queryForm = reactive({
  intermediateCode: '',
  randomCode: ''
})

const loaded = ref(false)

const queryRules = reactive({
  intermediateCode: [{required: true, message: "评议中间码不能为空", trigger: "blur"}],
  randomCode: [{required: true, message: "评议随机码不能为空", trigger: "blur"}],
})

const answerForm = reactive({
  answers: {}
})

const {proxy} = getCurrentInstance()

const order = ref({})

/**
 * 加载评议内容
 */
function loadEvaluate() {
  proxy.$refs["queryRef"].validate(valid => {
    if (valid) {
      evaluateContent(queryForm).then(response => {
        order.value = response.data
        loaded.value = true
        proxy.$modal.msgSuccess("加载成功")
      }).catch(error => {
        console.log(error)
      })
    }
  })
}

/**
 * 重置查询
 */
function resetQuery() {
  Object.assign(queryForm, {
    intermediateCode: '',
    randomCode: ''
  })
  order.value = {
    answers: {}
  }
  Object.assign(answerForm, {
    answers: {}
  })
  loaded.value = false
}

/**
 * 提交评议
 */
function submitEvaluate() {
  if (!validateAnswers()) {
    return
  }
  const answer = buildRecords()
  const receipt = {
    orderId: order.value.orderId,
    intermediateCode: queryForm.intermediateCode,
    randomCode: queryForm.randomCode,
    answers: answer
  }
  submitAnswer(receipt).then(response => {
    proxy.$modal.msgSuccess("提交成功")
    resetQuery()
  }).catch(error => {
    proxy.$modal.msgError("提交失败，请联系管理员")
    console.log(error)
  })
  console.log("提交评议");
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
</script>

<style scoped>
.evaluate-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.content-card {
  min-height: 500px;
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