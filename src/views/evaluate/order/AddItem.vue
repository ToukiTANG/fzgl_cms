<template>
  <el-dialog v-model="dialogVisible">

  </el-dialog>
</template>

<script setup>
defineProps({
  orderId: String
})
const dialogVisible = defineModel()

function open(orderId) {
  dialogVisible.value = true
}
defineExpose({
  open
})
</script>

<style scoped lang="scss">

</style>