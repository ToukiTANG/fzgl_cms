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
          <el-table-column label="评议单编号" align="center" key="orderId" prop="orderId"
                           :show-overflow-tooltip="true"/>
          <el-table-column label="评议事项名" align="center" key="evaluateName" prop="evaluateName"/>
          <el-table-column label="被评议人姓名" align="center" key="evaluatedPersonName" prop="evaluatedPersonName"/>
          <el-table-column label="被评议人部门" align="center" key="evaluatedPersonDepartment"
                           prop="evaluatedPersonDepartment"/>
          <el-table-column label="评议截止日期" align="center" key="deadline" prop="deadline"/>
          <el-table-column label="备注" align="center" key="remark" prop="remark" :show-overflow-tooltip="true"
                           width="120"/>
          <el-table-column label="执行状态" align="center" key="status" prop="status">
            <template #default="scope">
              <dict-tag :options="orderStatus" :value="scope.row.status"/>
            </template>
          </el-table-column>
          <el-table-column label="创建日期" align="center" key="createTime" prop="createTime"/>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
            <template #default="scope">
              <el-tooltip content="发布评议" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Position" @click="handlePublish(scope.row)"
                           v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                           v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                           v-hasPermi="['system:role:remove']"></el-button>
              </el-tooltip>
              <!--              <el-tooltip content="数据权限" placement="top" v-if="scope.row.roleId !== 1">-->
              <!--                <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>-->
              <!--              </el-tooltip>-->
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList"/>

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" v-model="addOrUpdateVisible" width="500px" append-to-body>
          <el-form ref="orderRef" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="被评议人姓名" prop="evaluatedPersonName">
              <el-input v-model="form.evaluatedPersonName" placeholder="请输入被评议人姓名"/>
            </el-form-item>
            <el-form-item label="被评议人部门" prop="evaluatedPersonDepartment">
              <el-input v-model="form.evaluatedPersonDepartment" placeholder="请输入被评议人部门"/>
            </el-form-item>
            <el-form-item label="评议截止日期" prop="deadline">
              <el-date-picker
                  v-model="form.deadline"
                  value-format="YYYY-MM-DD"
                  type="date"
                  placeholder="请选择评议截止日期"/>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </template>
        </el-dialog>
      </el-col>

    </el-row>

  </div>
</template>
<script setup>

import {addOrder, getOrder, listOrder, publishOrder, removeOrder, updateOrder} from "@/api/evaluate/order/api.js";

const loading = ref(true)
const oderList = ref([])
const total = ref(0)
const showSearch = ref(true)
const dateRange = ref([])
const title = ref("")
const single = ref(true)
const multiple = ref(true)
const ids = ref([])
const {proxy} = getCurrentInstance()
const addOrUpdateVisible = ref(false)

const {evaluate_order_status: orderStatus} = proxy.useDict("evaluate_order_status")

const data = reactive({
  form: {
    evaluatedPersonName: '',
    evaluatedPersonDepartment: '',
    deadline: undefined,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    evaluatedPersonName: undefined,
  },
  rules: {
    evaluatedPersonName: [{required: true, message: "被评议人姓名不能为空", trigger: "blur"}],
    evaluatedPersonDepartment: [{required: true, message: "被评议人部门不能为空", trigger: "blur"}],
    deadline: [{required: true, message: "评议截止日期不能为空", trigger: "blur"}]
  }
})

const {queryParams, form, rules} = toRefs(data)

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


/** 重置操作表单 */
function reset() {
  form.value = {}
  proxy.resetForm("orderRef")
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  addOrUpdateVisible.value = true
  title.value = "新增评议单"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const updateId = row.orderId || ids.value
  getOrder(updateId).then(res => {
    addOrUpdateVisible.value = true
    form.value = res.data
    title.value = "修改角色"
  }).catch(err => {
    console.log(err)
  })

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
  proxy.$modal.confirm('是否发布编号为"' + orderId + '"的数据项?').then(function () {
    return publishOrder(orderId)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch((err) => {
    console.log({err})
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

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId !== undefined) {
        updateOrder(form.value).then(res => {
          proxy.$modal.msgSuccess("修改成功")
          addOrUpdateVisible.value = false
          getList()
        }).catch(err => {
          console.log({err})
        })
      } else {
        addOrder(form.value).then(res => {
          proxy.$modal.msgSuccess("新增成功")
          addOrUpdateVisible.value = false
          getList()
        }).catch(err => {
          console.log({err})
        })
      }
    }
  })
}

/** 取消按钮 */
function cancel() {
  addOrUpdateVisible.value = false
  reset()
}

onMounted(() => {
  getList()
})
</script>
<style>
</style>
