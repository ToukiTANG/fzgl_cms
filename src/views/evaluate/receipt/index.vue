<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="100px">
          <el-form-item label="评议中间码" prop="intermediateCode">
            <el-input v-model="queryParams.intermediateCode" placeholder="请输入中间码" clearable
                      style="width: 240px"
                      @keyup.enter="handleQuery"/>
          </el-form-item>
          <el-form-item label="评议随机码" prop="intermediateCode">
            <el-input v-model="queryParams.randomCode" placeholder="请输入中间码随机码" clearable
                      style="width: 240px"
                      @keyup.enter="handleQuery"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="receiptList">
          <el-table-column label="回执单编号" align="center" key="receiptId" prop="receiptId"
                           :show-overflow-tooltip="true"
                           width="200"/>
          <el-table-column label="评议单编号" align="center" key="orderId" prop="orderId" :show-overflow-tooltip="true"
                           width="200"/>
          <el-table-column label="评议中间码" align="center" key="intermediateCode" prop="intermediateCode"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="评议随机码" align="center" key="randomCode" prop="randomCode"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="提交时间" align="center" key="createTime" prop="createTime"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px">
            <template #default="scope">
              <el-tooltip content="查看评议内容" placement="top">
                <router-link :to="'/evaluate/answer-data/index/' + scope.row.receiptId" class="link-type">
                  <el-button link type="primary" icon="View" @click="" v-hasPermi="['evaluate:answer:detail']"/>
                </router-link>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList"/>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>

import {listReceipt} from "@/api/evaluate/receipt/api.js";

const loading = ref(false)
const total = ref(0)
const receiptList = ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    intermediateCode: undefined,
    randomCode: undefined,
  },
})
const {queryParams} = toRefs(data)

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 查询回执单列表 */
function getList() {
  loading.value = true
  listReceipt(queryParams.value).then(response => {
    loading.value = false
    receiptList.value = response.rows
    total.value = response.total
  }).catch(error => {
    console.log(error)
    loading.value = false
  })
}

/** 重置按钮操作 */
function resetQuery() {
  handleQuery()
}

onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">

</style>