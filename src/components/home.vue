<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>****商城后台管理系统</span>
      </div>
      <el-button @click="signOut">推出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggleCollapse" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIconFontObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveActivePath('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-location"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      menuIconFontObj: {
        '125': 'iconfont icon-yonghuguanli',
        '103': 'iconfont icon-quanxianguanli',
        '101': 'iconfont icon-shangpinguanli',
        '102': 'iconfont icon-dingdanguanli',
        '145': 'iconfont icon-fl-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    signOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.msg)
      }
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveActivePath(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #b3c0d1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 20px;
  color: white;
  div {
    display: flex;
    align-items: center;
    img {
      width: 50px;
      height: 50px;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #545c64;
  .toggleCollapse {
    color: white;
    text-align: center;
    background-color: rgb(68, 64, 64);
    line-height: 26px;
    font-size: 10px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #e9eef3;
}
.iconfont {
  margin-right: 10px;
  color: white;
}
</style>


