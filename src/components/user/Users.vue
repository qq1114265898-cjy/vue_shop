<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserData">
            <el-button slot="append" icon="el-icon-search" @click="getUserData"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 状态开关 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 删改操作 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 文字提示 -->
            <el-tooltip content="分配角色" placement="top" effect="dark" :enterable="false">
              <!-- 分配权限 -->
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pageSize"
        :total="total"
      ></el-pagination>
      <!-- 添加用户对话框区域 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="60%" @close="dialogClose">
        <!-- 内容区域 -->
        <el-form
          :model="addForm"
          :rules="rules"
          ref="addFormRef"
          label-width="100px"
          label-position="left"
          status-icon
        >
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="addForm.userName"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="passWord">
            <el-input v-model="addForm.passWord"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户信息对话框区域 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="60%"
        @close="editDialogClose"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="100px"
          label-position="left"
          status-icon
        >
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editFormSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    // 自定义校验规则
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    const checkMobile = (rule, value, cb) => {
      const regMobile = /^1(3|4|5|7|8)\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      // 获取用户列表的参数
      queryInfo: {
        query: '',
        currentPage: 1,
        pageSize: 2
      },
      // 用户列表绑定对象 用于展示用户可视化信息
      userList: [],
      total: 0,
      // 对话框的默认值
      dialogVisible: false,
      editDialogVisible: false,
      // 添加用户表单的绑定对象
      addForm: {
        userName: '',
        passWord: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的校验规则
      rules: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名应在3-10位之间', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 15, message: '密码应在6-15位之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户信息表单的绑定对象
      editForm: {},
      // 编辑用户表单的校验规则
      editFormRules: {
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 组件创建时获取数据
    this.getUserData()
  },
  methods: {
    // 定义获取用户列表数据方法
    getUserData() {
      const params = {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.currentPage,
        pagesize: this.queryInfo.pageSize
      }
      this.$http.get('users', { params }).then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.data.users
        this.total = res.data.data.total
        // console.log(this.userList)
        // console.log(this.total)
      })
    },
    // 每页显示数量(pagesize)发生改变触发
    handleSizeChange(pageSize) {
      // console.log(pageSize)
      this.queryInfo.pageSize = pageSize
      this.getUserData()
    },
    // 监听页码值发生改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.currentPage = newPage
      this.getUserData()
    },
    // 监听用户状态发生改变事件
    changeUserState(userInfo) {
      // console.log(userInfo)
      this.$http
        .put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        .then(res => {
          // console.log(res)
          if (res.data.meta.status !== 200) {
            // 操作失败取反
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error(res.data.meta.msg)
          }
          this.$message.success(res.data.meta.msg)
        })
    },
    // 监听添加按钮进行添加用户表单验证
    submitAddForm() {
      this.$refs.addFormRef.validate(valid => {
        console.log(valid)
        if (!valid) return false
        const params = {
          username: this.addForm.userName,
          password: this.addForm.passWord,
          email: this.addForm.email,
          mobile: this.addForm.mobile
        }
        this.$http.post('users', params).then(res => {
          console.log(res)
          if (res.data.meta.status !== 201) {
            return this.$message.error(res.data.meta.msg)
          }
          this.dialogVisible = false
          this.getUserData()
          this.$message.success(res.data.meta.msg)
        })
      })
    },
    // 监听对话框关闭事件
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听编辑用户信息对话框关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 展示编辑用户对话框
    showEditDialog(id) {
      this.editDialogVisible = true
      this.$http.get(`users/${id}`).then(res => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.editForm = res.data.data
      })
    },
    // 监听添加按钮进行编辑用户信息表单验证
    editFormSubmit() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return false
        // 发起修改用户信息的网络请求
        const params = {
          id: this.editForm.id,
          email: this.editForm.email,
          mobile: this.editForm.mobile
        }
        this.$http.put(`users/${params.id}`, params).then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.editDialogVisible = false
          this.getUserData()
          this.$message.success(res.data.meta.msg)
        })
      })
    },
    // 根据ID删除用户信息
    removeUserById(id) {
      console.log(id)
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(`users/${id}`, id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.getUserData()
            this.$message.success(res.data.meta.msg)
          })
        })
        // 用户取消删除
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
