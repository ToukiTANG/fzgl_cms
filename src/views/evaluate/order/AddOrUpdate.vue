<template>
  <el-dialog :title="dialogTitle" v-model="addOrUpdateVisible" append-to-body width="80%" @close="cancel">

    <el-form ref="orderRef" :model="form" :rules="rules" label-width="120px">
      <el-card shadow="never" style="margin-bottom: 16px">
        <template #header>
          基本信息
        </template>
        <el-form-item label="评议事项名称" prop="evaluateName">
          <el-input v-model="form.evaluateName" placeholder="请输入评议事项名称" :disabled="editDisable"/>
        </el-form-item>
        <el-form-item label="被评议人姓名" prop="evaluatedPersonName">
          <el-input v-model="form.evaluatedPersonName" placeholder="请输入被评议人姓名" :disabled="editDisable"/>
        </el-form-item>
        <el-form-item label="被评议人部门" prop="evaluatedPersonDepartment">
          <el-input v-model="form.evaluatedPersonDepartment" placeholder="请输入被评议人部门" :disabled="editDisable"/>
        </el-form-item>
        <el-form-item label="评议截止日期" prop="deadline">
          <el-date-picker
              v-model="form.deadline"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="请选择评议截止日期"
              :disabled="editDisable"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注内容" :disabled="editDisable"/>
        </el-form-item>
      </el-card>

      <el-card shadow="never" style="margin-bottom: 16px">
        <template #header>
          评议内容
        </template>
        <div v-for="(item,index) in form.items" :key="index" class="item-card" style="margin-bottom: 16px">
          <el-card>
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>项点{{ index + 1 }}</span>
                <el-button type="danger" @click="removeItem(index)" :disabled="editDisable">删除</el-button>
              </div>
            </template>
            <el-form-item label="题目内容" :prop="`items.${index}.title`"
                          :rules="[{required: true,message: '请输入题目内容',trigger: 'blur'}]">
              <el-input v-model="item.title" placeholder="请输入题目" :disabled="editDisable"/>
            </el-form-item>

            <div :class="{'option-type-box': item.itemType === 0 || item.itemType === 1}">
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-form-item label="类型" :prop="`items.${index}.itemType`"
                                :rules="[{required: true,message: '请选择题型',trigger: 'change'}]">
                    <el-select v-model="item.itemType" :disabled="editDisable">
                      <el-option v-for="option in itemTypeOptions" :key="Number(option.value)" :label="option.label"
                                 :value="Number(option.value)"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <div v-if="item.itemType===0||item.itemType===1" class="add-option-btn" :class="{ 'but-disabled': editDisable }"
                       @click="!editDisable && addOption(item)">
                    <el-icon size="15px" >
                      <Plus/>
                    </el-icon>
                  </div>
                </el-col>
              </el-row>

              <div v-if="item.itemType===0||item.itemType===1" v-for="(option,optionIndex) in item.options"
                   :key="optionIndex">
                <el-row :gutter="5">
                  <el-col :span="6">
                    <el-form-item
                        label="标签(ABCD)" :prop="`items.${index}.options.${optionIndex}.optionCode`"
                        :rules="[ {required: true, message: '请输入选项标签', trigger: 'blur' } ]">
                      <el-input v-model="option.optionCode" placeholder="选项标签" :disabled="editDisable"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="11">
                    <el-form-item label="选项内容" label-width="80"
                                  :prop="`items.${index}.options.${optionIndex}.optionContent`"
                                  :rules="[ { required: true, message: '请输入选项内容', trigger: 'blur' }]">
                      <el-input v-model="option.optionContent" placeholder="选项内容" :disabled="editDisable"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="选项排序" label-width="80"
                                  :prop="`items.${index}.options.${optionIndex}.sortNum`"
                                  :rules="[{required: true, message: '请输入排序号', trigger: 'blur' } ]">
                      <el-input-number v-model="option.sortNum" placeholder="排序" :disabled="editDisable"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="1" style="display: flex;justify-content: flex-end;">
                    <el-button type="danger" @click="removeOption(item,optionIndex)" :disabled="editDisable">删除
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </div>

            <el-form-item label="是否必填" :prop="`items.${index}.required`"
                          :rules="[{required: true,message: '请选择是否必填', trigger: 'change' } ]">
              <el-radio-group v-model="item.required" :disabled="editDisable">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="题目排序" :prop="`items.${index}.sortNum`"
                          :rules="[ {required: true, message: '请输入排序号', trigger: 'blur' } ]">
              <el-input-number v-model="item.sortNum" :disabled="editDisable"/>
            </el-form-item>

          </el-card>
        </div>
        <div class="add-item-btn" :class="{ 'but-disabled': editDisable }" @click="!editDisable && addItem()">
          <el-icon size="30px">
            <CirclePlus/>
          </el-icon>
        </div>
      </el-card>


    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="editDisable">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {addOrder, getOrder, updateOrder} from "@/api/evaluate/order/api.js";
import {CirclePlus, Plus} from "@element-plus/icons-vue";

const addOrUpdateVisible = defineModel()
const dialogTitle = ref('')
const {proxy} = getCurrentInstance()
const {evaluate_item_type: itemTypeOptions} = proxy.useDict("evaluate_item_type")
const editDisable = ref(false)

function open(title, orderId) {
  if (orderId) {
    getOrder(orderId).then(res => {
      form.value = res.data
      if (form.value.status !== 0) {
        editDisable.value = true
      }
      addOrUpdateVisible.value = true
      dialogTitle.value = title
    }).catch(err => {
      console.log({err})
    })
  } else {
    addOrUpdateVisible.value = true
    dialogTitle.value = title
    initForm()
  }
}

defineExpose({
  open
})
const data = reactive({
  form: {
    orderId: undefined,
    evaluateName: '',
    evaluatedPersonName: '',
    evaluatedPersonDepartment: '',
    deadline: undefined,
    items: [{
      orderId: '',
      title: '',
      itemType: undefined,
      required: false,
      sortNum: undefined,
      options: [{
        itemId: undefined,
        optionCode: undefined,
        optionContent: '',
        sortNum: undefined,
      }]
    }],
  },
  rules: {
    evaluateName: [{required: true, message: "评议事项名称不能为空", trigger: "blur"}],
    evaluatedPersonName: [{required: true, message: "被评议人姓名不能为空", trigger: "blur"}],
    evaluatedPersonDepartment: [{required: true, message: "被评议人部门不能为空", trigger: "blur"}],
    deadline: [{required: true, message: "评议截止日期不能为空", trigger: "blur"}]
  }
})

const {form, rules} = toRefs(data)
const emit = defineEmits(['success'])

/* 重置表单 */
function initForm() {
  form.value = {
    orderId: undefined,
    evaluateName: '',
    evaluatedPersonName: '',
    evaluatedPersonDepartment: '',
    deadline: undefined,
    items: [],
  }
  editDisable.value = false
}

/** 提交按钮 */
function submitForm() {
  if (!form.value.items.length) {
    proxy.$modal.msgError("请至少添加一个评议项点")
    return
  }

  console.log(form.value.items)
  const invalidItem = form.value.items.find(item =>
      (item.itemType === 0 || item.itemType === 1)
      && (!item.options || item.options.length === 0)
  )

  if (invalidItem) {
    proxy.$modal.msgError("单选题或多选题至少需要一个选项")
    return
  }
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId !== undefined) {
        updateOrder(form.value).then(res => {
          proxy.$modal.msgSuccess("修改成功")
          addOrUpdateVisible.value = false
          emit('success')
        }).catch(err => {
          console.log({err})
        })
      } else {
        addOrder(form.value).then(res => {
          proxy.$modal.msgSuccess("新增成功")
          addOrUpdateVisible.value = false
          emit('success')
        }).catch(err => {
          console.log({err})
        })
      }
    }
  })
}


/** 重置操作表单 */
function reset() {
  proxy.resetForm("orderRef")
}

/** 取消按钮 */
function cancel() {
  addOrUpdateVisible.value = false
  initForm()
}

/**
 * 增加题目
 */
function addItem() {
  form.value.items.push({
    orderId: form.value.orderId,
    title: '',
    itemType: undefined,
    required: true,
    sortNum: form.value.items.length + 1,
    options: []
  })
}

/**
 * 删除题目
 * @param index
 */
function removeItem(index) {
  form.value.items.splice(index, 1)
}

/* 增加选项 */
function addOption(item) {
  console.log(form.value)
  item.options.push({
    itemId: undefined,
    optionCode: undefined,
    optionContent: '',
    sortNum: item.options.length + 1,
  })
}

function removeOption(item, optionIndex) {
  item.options.splice(optionIndex, 1)
}

onMounted(() => {
})
</script>

<style scoped lang="scss">
.add-item-btn {
  margin-top: 20px;
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: 2px dashed #dcdfe6;
  border-radius: 8px;

  cursor: pointer;

  color: #909399;
  font-size: 14px;

  transition: all 0.2s;
}

.add-item-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}

.add-option-btn {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px dashed #409eff;
  border-radius: 50%;

  cursor: pointer;

  color: #409eff;

  transition: all 0.2s;
}

.add-option-btn:hover {
  background-color: #ecf5ff;
  transform: scale(1.1);
}

.option-type-box {
  padding: 12px;
  margin-bottom: 12px;

  border: 1px dashed #dcdfe6;
  border-radius: 6px;

  transition: all .2s;
}

.option-type-box:hover {
  border-color: #409eff;
}

.but-disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}
</style>