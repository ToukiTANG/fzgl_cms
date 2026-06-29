<template>
  <div class="app-container">

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
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" @click="openAnswer(row)" size="small">查看评议内容</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <AnswerView ref="answerDialogRef" @success="handleAnswerSuccess"/>
  </div>
</template>

<script setup>
import AnswerView from "@/views/evaluate/answer/AnswerView.vue";
import {useRoute} from "vue-router";
import {receiptDetail} from "@/api/evaluate/answer/api.js";

const route = useRoute()
const answerDialogRef = ref()
const order = ref({
  persons: []
})

/**
 * 加载评议内容
 */
function loadEvaluate(receiptId) {
  receiptDetail(receiptId).then((res) => {
    order.value = res.data.order
    const receipt = res.data.receipt
    const answerMap = new Map()

    // 按 personId 分组
    receipt.answers.forEach(answer => {
      if (!answerMap.has(answer.personId)) {
        answerMap.set(answer.personId, [])
      }

      answerMap.get(answer.personId).push(answer)
    })

    // 给每个人挂上 answers
    order.value.persons.forEach(person => {
      person.answers = answerMap.get(person.personId) || []
    })
  }).catch((err) => {
    console.log(err)
  })
}

function handleAnswerSuccess(updatedPerson) {
  const index = order.value.persons.findIndex(
      p => p.personId === updatedPerson.personId
  )

  if (index !== -1) {
    order.value.persons[index] = updatedPerson
  }
}

function openAnswer(person) {
  answerDialogRef.value.open(
      order.value,
      person
  )
}

onMounted(() => {
  loadEvaluate(route.params.receiptId)
})

</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>