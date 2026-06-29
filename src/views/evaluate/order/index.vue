<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
          <el-form-item label="被评议人姓名" prop="evaluatedPersonName">
            <el-input v-model="queryParams.evaluatedPersonName" placeholder="请输入被评议人姓名" clearable
                      style="width: 240px"
                      @keyup.enter="handleQuery"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['evaluate:order:add']">新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                       v-hasPermi="['evaluate:order:edit']">修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                       v-hasPermi="['evaluate:order:remove']">删除
            </el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="oderList" @selection-change="handleSelectionChange">

          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column label="评议单编号" align="center" key="orderId" prop="orderId" :show-overflow-tooltip="true"
                           width="200"/>
          <el-table-column label="评议事项名" align="center" key="evaluateName" prop="evaluateName" width="400px"/>
          <el-table-column label="评议单类型" align="center" key="type" prop="type" width="130">
            <template #default="scope">
              <dict-tag :options="orderType" :value="scope.row.type"/>
            </template>
          </el-table-column>
          <el-table-column label="评议截止日期" align="center" key="deadline" prop="deadline" width="130"/>
          <el-table-column label="评议中间码" align="center" key="intermediateCode" prop="intermediateCode"
                           width="120px"/>
          <el-table-column label="执行状态" align="center" key="status" prop="status" width="100px">
            <template #default="scope">
              <dict-tag :options="orderStatus" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" key="remark" prop="remark" :show-overflow-tooltip="true"
                           width="200"/>
          <el-table-column label="创建日期" align="center" key="createTime" prop="createTime" width="200px"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="150px">
            <template #default="scope">
              <el-tooltip content="查看/修改" placement="top">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                           v-hasPermi="['evaluate:order:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                           v-hasPermi="['evaluate:order:remove']"></el-button>
              </el-tooltip>
              <el-tooltip content="发布评议" placement="top">
                <el-button link type="primary" icon="Position" @click="handlePublish(scope.row)"
                           v-hasPermi="['evaluate:order:publish']" v-show="scope.row.status===0"></el-button>
              </el-tooltip>
              <el-tooltip content="查看随机码" placement="top">
                <el-button link type="primary" icon="View" @click="codeInfo(scope.row)"
                           v-hasPermi="['evaluate:order:codeInfo']" v-show="scope.row.status!==0"></el-button>
              </el-tooltip>
              <!--              <el-tooltip content="添加评议事项" placement="top">-->
              <!--                <el-button link type="primary" icon="Plus" @click="handleAddItem(scope.row)"-->
              <!--                           v-hasPermi="['evaluate:order:edit']"></el-button>-->
              <!--              </el-tooltip>-->
              <!--              <el-tooltip content="数据权限" placement="top" v-if="scope.row.roleId !== 1">-->
              <!--                <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['evaluate:order:edit']"></el-button>-->
              <!--              </el-tooltip>-->
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList"/>
        <add-or-update ref="addOrUpdateRef" @success="getList"/>
        <add-code ref="addCodeRef" @success="getList"/>
      </el-col>
      <el-dialog v-model="codeVisible" title="查看随机码">
        <el-table :data="codeList">
          <el-table-column label="随机码" key="code" prop="code" align="center"/>
          <el-table-column label="随机码可使用次数" key="count" prop="count" align="center"/>
        </el-table>
      </el-dialog>
    </el-row>

  </div>
</template>
<script setup>

import {codeDetail, listOrder, removeOrder} from "@/api/evaluate/order/api.js";
import AddOrUpdate from "@/views/evaluate/order/AddOrUpdate.vue";
import AddCode from "@/views/evaluate/order/AddCode.vue";

const loading = ref(true)
const oderList = ref([])
const total = ref(0)
const showSearch = ref(true)
const dateRange = ref([])
const single = ref(true)
const multiple = ref(true)
const ids = ref([])
const addOrUpdateRef = ref()
const addCodeRef = ref()
const {proxy} = getCurrentInstance()
const codeVisible = ref(false)
const codeList = ref([])

const {evaluate_order_status: orderStatus} = proxy.useDict("evaluate_order_status")
const {evaluate_order_type: orderType} = proxy.useDict("evaluate_order_type")

const data = reactive({
  form: {
    evaluateName: '',
    evaluatedPersonName: '',
    evaluatedPersonDepartment: '',
    deadline: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    evaluatedPersonName: undefined,
  },
})

const {queryParams} = toRefs(data)

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orderId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  addOrUpdateRef.value.open('新增评议单', undefined)
}

/** 修改按钮操作 */
function handleUpdate(row) {
  addOrUpdateRef.value.open('修改评议单', row.orderId)
}

/** 删除按钮操作 */
function handleDelete(row) {
  const orderIds = row.orderId || ids.value
  const idArray = Array.isArray(orderIds) ? orderIds : [orderIds]
  console.log(idArray)
  proxy.$modal.confirm('是否确认删除编号为"' + orderIds + '"的数据项?').then(function () {
    return removeOrder(idArray)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch((err) => {
    console.log({err})
  })
}

/** 发布按钮操作 */
function handlePublish(row) {
  const orderId = row.orderId
  addCodeRef.value.open('生成随机码', orderId)
}

/** 查看随机码 */
function codeInfo(row) {
  codeDetail(row.orderId).then(res => {
    codeVisible.value = true
    codeList.value = res.data
  }).catch((err) => {
    console.log(err)
  })
}

/** 查询评议单列表 */
function getList() {
  loading.value = true
  listOrder(queryParams.value).then(res => {
    loading.value = false
    oderList.value = res.rows
    total.value = res.total
  }).catch(err => {
    console.log(err)
    loading.value = false
  })
}

onMounted(() => {
  getList()
})
</script>
<style>
</style>
