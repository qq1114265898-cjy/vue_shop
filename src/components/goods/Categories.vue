<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效区域 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color:lightgreen"
          ></i>
          <i v-else class="el-icon-error" style="color:red"></i>
        </template>
        <!-- 排序区域 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">等级一</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">等级二</el-tag>
          <el-tag v-else type="warning">等级三</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框区域 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisble" @close="closeAddCateForm">
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        status-icon
        label-position="left"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cateName">
          <el-input v-model="addCateForm.cateName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKey"
            :options="parentCateList"
            :props="cascaderProp"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="submitAddCateForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 请求参数数据
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 响应的分类数据
      cateList: [],
      // 总页数
      total: 0,
      // 对话框默认是否显示
      addCateDialogVisble: false,
      // 添加分类表单绑定数据
      addCateForm: {
        cateName: '',
        // 父级分类的ID
        catePid: 0,
        // 分类的等级
        cateLevel: 0
      },
      // 显示父级分类数据(级联选择框)
      parentCateList: [],
      // 级联选择器配置
      cascaderProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中分类的ID数组
      selectedKey: [],
      // 为tabel指定列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类表单校验规则
      addCateRules: {
        cateName: [
          { required: true, message: '分类不能为空', trigger: 'blur' },
          { min: 3, max: 8, message: '分类名应在3-10位之间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 请求商品分类数据列表
    getCateList() {
      this.$http.get('categories', { params: this.queryInfo }).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.total = res.data.data.total
        this.cateList = res.data.data.result
        // console.log(this.cateList)
      })
    },
    // 当前页发生改变事件
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getCateList()
    },
    // 展示添加分类对话框
    showCateDialog() {
      this.$http.get('categories', { params: { type: 2 } }).then(res => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.parentCateList = res.data.data
      })
      this.addCateDialogVisble = true
    },
    // 关闭添加分类对话框
    closeAddCateForm() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKey = []
      this.addCateForm.catePid = 0
      this.addCateForm.cateLevel = 0
    },
    // 级联选择器选项发生变化
    parentCateChange() {
      if (this.selectedKey.length > 0) {
        this.addCateForm.catePid = this.selectedKey[this.selectedKey.length - 1]
        // console.log(this.addCateForm.catePid)
        this.addCateForm.cateLevel = this.selectedKey.length
      } else {
        this.addCateForm.catePid = 0
        this.addCateForm.cateLevel = 0
      }
    },
    // 提交添加分类表单
    submitAddCateForm() {
      const params = {
        cat_pid: this.addCateForm.catePid,
        cat_name: this.addCateForm.cateName,
        cat_level: this.addCateForm.cateLevel
      }
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return
        this.$http.post('categories', params).then(res => {
          if (res.data.meta.status !== 201) {
            return this.$message.error(res.data.meta.msg)
          }
          this.$message.success(res.data.meta.msg)
          this.getCateList()
        })
      })
      this.addCateDialogVisble = false
    }
  }
}
</script>
<style scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
