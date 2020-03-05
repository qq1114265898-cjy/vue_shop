<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框列 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
            @clear="claerInputValue"
          >
            <el-button slot="append" icon="el-icon-search" @click="serchClick"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="stepToAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="110px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="170px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">修改</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGoodsById(scope.row.goods_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 商品列表总页数
      total: 0,
      // 商品列表数据参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取到的商品列表数据 (商品信息 ID 名称 页数)
      goodsList: []
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表数据
    getGoodsList() {
      this.$http
        .get('goods', {
          params: this.queryInfo
        })
        .then(res => {
          console.log(res)
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.total = res.data.data.total
          this.goodsList = res.data.data.goods
        })
    },
    // pagesize发生改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页发生改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击搜索事件
    serchClick() {
      this.getGoodsList()
    },
    // 清除输入框内容
    claerInputValue() {
      this.queryInfo.query = ''
      this.getGoodsList()
    },
    // 删除商品
    removeGoodsById(goodsId) {
      this.$confirm('确认要删除该商品吗？', '提醒', {
        type: 'wraning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$http.delete(`goods/${goodsId}`).then(res => {
            console.log(res)
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.$message.success(res.data.meta.msg)
            this.getGoodsList()
          })
        })
        .catch(() => {
          this.$message.info('取消了删除')
        })
    },
    // 跳转到添加商品页
    stepToAdd() {
      this.$router.push('goods/add')
    }
  }
}
</script>

<style scoped>
</style>
