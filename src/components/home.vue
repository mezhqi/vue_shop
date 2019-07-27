<template>
  <div>
    <el-button @click="signOut">推出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    signOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>


