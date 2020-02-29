<template>
  <el-container class="home-contaniner">
    <!-- 头部区域 -->
    <el-header>
      <div class="header-left">
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <div>
        <el-button type="info" @click="logout">退出</el-button>
      </div>
    </el-header>
    <!-- 中间区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          v-if="Object.keys(menuList).length !== 0"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eef"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activeIndex"
        >
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="String(item.id)">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="item2 in item.children"
              :key="item2.id"
              :index="'/' + item2.path"
              @click="getIndex('/' + item2.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{item2.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主要内容 -->
      <el-main>
        <!-- 子路由占位符 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 侧边栏数据
      menuList: [],
      // 动态图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 当前活跃菜单index
      activeIndex: ''
    }
  },
  created() {
    // 调用获取侧边栏数据
    this.getMenuList()
    // 组件创建时默认活跃菜单
    this.activeIndex = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取侧边栏数据
    getMenuList() {
      this.$http.get('/menus').then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.menuList = res.data.data
        // console.log(this.MenuList)
      })
    },
    // 点击按钮，展开侧边栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击获取对应二级菜单的index
    getIndex(index) {
      window.sessionStorage.setItem('activePath', index)
      this.activeIndex = index
      // console.log(this.activeIndex)
    }
  }
}
</script>

<style lang="less" scoped>
.home-contaniner {
  height: 100%;
}
// 头部
.el-header {
  background-color: #373d41;
  padding-left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  .header-left {
    display: flex;
    align-items: center;
  }
  img {
    width: 60px;
    height: 60px;
  }
  span {
    margin-left: 15px;
  }
}
// 侧边栏
.el-aside {
  background-color: #333744;
}
.toggle-button {
  background-color: #4a5064;
  color: #fff;
  text-align: center;
  line-height: 21px;
  letter-spacing: 0.2em;
  font-size: 10px;
  cursor: pointer;
}
.el-menu {
  border-right: none;
}
.iconfont {
  margin-right: 10px;
}
// 主要内容
.el-main {
  background-color: #eaedf1;
}
</style>
