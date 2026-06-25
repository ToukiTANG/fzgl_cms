<template>
  <div class="app-container">

    <!-- 查询区域 -->
    <el-card class="search-card">
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

    <!-- 基本信息 -->
    <el-card style="margin-top:10px">
      <template #header>
        <span>评议信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="评议名称">{{ order.evaluateName }}</el-descriptions-item>
        <el-descriptions-item label="截止日期"> {{ order.deadline }}</el-descriptions-item>
        <el-descriptions-item label="随机码"> {{ order.intermediateCode }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top:10px">
      <template #header>
        <span>被评议人员</span>
      </template>

      <el-table :data="order.persons" border>
        <el-table-column label="姓名" prop="name" align="center"/>
        <el-table-column label="部门" prop="department" align="center"/>
        <el-table-column label="状态" prop="personStatus" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.personStatus" type="success">已评议</el-tag>
            <el-tag v-else type="warning">未评议</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" @click="openAnswer(row)" size="small">开始评议</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <AnswerData ref="answerDialogRef" @success="loadData"/>
  </div>
</template>

<script setup>
import AnswerData from "@/views/evaluate/answer/AnswerData.vue";
import {evaluateContent} from "@/api/evaluate/execution/api.js";

const answerDialogRef = ref()
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

const order = ref({})

function loadData() {
  // 查询评议单详情
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

function openAnswer(person) {
  answerDialogRef.value.open(
      order.value,
      person
  )
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">

</style>