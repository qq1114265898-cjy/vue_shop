<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="90px"></el-table-column>
        <el-table-column label="是否付款" width="90px">
          <template slot-scope="scope">
            <el-tag v-if="parseInt(scope.row.order_pay) === 1">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="90px"></el-table-column>
        <el-table-column label="下单时间" width="160px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template>
            <el-button type="primary" icon="el-icon-edit" @click="editDialogVisible = true"></el-button>
            <el-button type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="60%" @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="editForm.address"
            :options="cityData"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailedAddress">
          <el-input v-model="editForm.detailedAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="editDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="60%">
      <span>物流信息</span>
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: '',
  data() {
    return {
      // 传参信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总页数
      total: 0,
      // 订单列表数据
      orderList: [],
      // 对话框是否可见
      editDialogVisible: false,
      progressDialogVisible: false,
      // 编辑表单数据源
      editForm: {
        address: [],
        detailedAddress: ''
      },
      // 编辑表单校验规则
      editFormRules: {
        address: [
          {
            required: true,
            message: '省市区/县不能为空',
            trigger: 'blur'
          }
        ],
        detailedAddress: [
          {
            required: true,
            message: '详细地址不能为空',
            trigger: 'blur'
          }
        ]
      },
      // 城市数据
      cityData,
      // 级联选择器配置
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      // 物流进度信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    getOrderList() {
      this.$http.get('orders', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.total = res.data.data.total
        this.orderList = res.data.data.goods
        console.log(this.orderList)
      })
    },
    // pagesize发生改变
    handleSizeChange(newSize) {},
    // 当前页发生改变
    handleCurrentChange(newPage) {},
    // 级联选择器选中项发生改变
    handleChange() {
      console.log(this.editForm.address)
    },
    // 编辑对话框关闭
    editDialogClose() {
      this.editDialogVisible = false
      this.$refs.editFormRef.resetFields()
    },
    // 展示物流信息
    showProgressBox() {
      this.$http.get('kuaidi/804909574412544580').then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.progressInfo = res.data.data
        console.log(this.progressInfo)
      })
      this.progressDialogVisible = true
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
