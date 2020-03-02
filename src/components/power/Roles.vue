<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addUserDialog=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 扩展区域 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',index1 == 0 ? 'bdtop' : '','vcenter']"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级权限区域 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 == 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限区域 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="[index3 == 0 ? '' : 'bdtop']"
                      v-for="(item3,index3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户对话框区域 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" @close="resetAddUserForm">
      <el-form
        :model="addForm"
        :rules="addUserRules"
        status-icon
        label-position="left"
        ref="addFormRef"
      >
        <el-form-item label="角色名称" prop="userName" label-width="100px">
          <el-input v-model="addForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="userDesc" label-width="100px">
          <el-input v-model="addForm.userDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑用户对话框区域 -->
    <el-dialog title="编辑用户" :visible.sync="editUserDialog" @close="resetEditUserForm">
      <el-form
        :model="editForm"
        :rules="editUserRules"
        status-icon
        label-position="left"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="userName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="userDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框区域 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisble" @close="closeSetRightDialog">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="treeDefCheckdKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="submitSetRightForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 权限列表数据(tree)
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形控件默认选中的节点ID
      treeDefCheckdKeys: [],
      // 添加用户对话框
      addUserDialog: false,
      // 编辑用户对话框
      editUserDialog: false,
      // 分配权限对话框
      setRightDialogVisble: false,
      // 当前操作行角色ID
      roleId: 0,
      // 添加用户表单绑定数据
      addForm: {
        userName: '',
        userDesc: ''
      },
      // 编辑用户表单绑定数据
      editForm: {},
      // 添加用户表单校验规则
      addUserRules: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名应在3-10位之间', trigger: 'blur' }
        ],
        userDesc: [
          { required: true, message: '用户描述不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '用户描述应在2-20位之间',
            trigger: 'blur'
          }
        ]
      },
      // 编辑用户号表单校验规则
      editUserRules: {
        roleName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名应在3-10位之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '用户描述不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '用户描述应在2-20位之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 请求角色列表数据
    getRolesList() {
      this.$http.get('roles').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.rolesList = res.data.data
      })
    },
    // 添加对话框取消事件
    resetAddUserForm() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑对话框取消事件
    resetEditUserForm() {
      this.$refs.editFormRef.resetFields()
    },
    // 显示编辑对话框
    showEditDialog(id) {
      this.editUserDialog = true
      // console.log(roleInfo)
      this.$http.get(`roles/${id}`).then(res => {
        console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.editForm = res.data.data
        console.log(this.editForm)
      })
    },
    // 添加对话框确认事件
    submitAddForm() {
      this.$refs.addFormRef.validate(valid => {
        const params = {
          roleName: this.addForm.userName,
          roleDesc: this.addForm.userDesc
        }
        if (!valid) return
        this.$http.post('roles', params).then(res => {
          if (res.data.meta.status !== 201) {
            return this.$message.error(res.data.meta.msg)
          }
          this.addUserDialog = false
          this.rolesList.push(res.data.data)
          this.$message.success(res.data.meta.msg)
        })
      })
    },
    // 编辑对话框确认事件
    submitEditForm() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return false
        // 发起修改用户信息的网络请求
        this.$http
          .put(`roles/${this.editForm.roleId}`, {
            id: this.editForm.roleId,
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          .then(res => {
            console.log(res)
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.editUserDialog = false
            this.getRolesList()
            this.$message.success(res.data.meta.msg)
          })
      })
    },
    // 根据ID删除对应角色
    removeRoleById(id) {
      this.$confirm('操作会永久删除该角色,确认吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(`roles/${id}`, id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.getRolesList()
            this.$message.success(res.data.meta.msg)
          })
        })
        .catch(() => {
          this.$message.info('已点击取消')
        })
    },
    // 根据ID删除对应权限
    removeRightById(role, rightId) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 发起删除权限网络请求
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.$message.success(res.data.meta.msg)
            role.children = res.data.data
          })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    // 展示分配权限对话框
    showSetRightDialog(role) {
      this.roleId = role.id
      this.$http.get('rights/tree').then(res => {
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.rightsList = res.data.data
        this.getLeafKeys(role, this.treeDefCheckdKeys)
      })
      this.setRightDialogVisble = true
    },
    // 递归获取角色下所有三级权限，并保存到数组arr中
    getLeafKeys(node, arr) {
      // 如果不包含children证明为三级节点，将id push进数组中,并终止
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果包含children证明不是三级节点
      node.children.forEach(item => {
        // 继续调用函数直到证明没有children属性为止
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭分配权限对话框时重置数组
    closeSetRightDialog() {
      this.treeDefCheckdKeys = []
    },
    // 提交分配权限对话框
    submitSetRightForm() {
      // 取得所有选中的包括半节点的ID
      const keys = this.$refs.treeRef.getCheckedKeys(false, true)
      // console.log(keys)
      const idStr = keys.join(',')
      // console.log(idStr)
      this.$http
        .post(`roles/${this.roleId}/rights`, { rids: idStr })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.setRightDialogVisble = false
          this.getRolesList()
          this.$message.success(res.data.meta.msg)
        })
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 10px;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
