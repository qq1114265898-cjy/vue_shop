<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 卡片顶部的警告区域 -->
      <el-alert title="只允许选择三级分类" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 级联选择器区域 -->
      <el-row class="cate-row">
        <el-col>
          <span>请选择商品分类：</span>
          <el-cascader
            v-model="selectedValues"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页区域 -->
      <el-tabs v-model="defaultActive" @tab-click="handleClick">
        <!-- 动态参数页签区域 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="this.selectedValues.length!==3"
            @click="addManyDialogVisble=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="paramsTableDatas.many" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagColse(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  clearable
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 操作 自定义区域 -->
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页签区域 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="this.selectedValues.length!==3"
            @click="addOnlyDialogVisble=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="paramsTableDatas.only" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagColse(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  clearable
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <!-- 操作 自定义区域 -->
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数对话框 -->
    <el-dialog
      title="添加动态参数"
      :visible.sync="addManyDialogVisble"
      width="60%"
      @close="closeAddManyDialog"
    >
      <!-- 添加动态参数表单区域 -->
      <el-form
        ref="addManyFormRef"
        :model="addManyForm"
        :rules="addManyFormRules"
        label-width="100px"
      >
        <el-form-item label="动态参数" prop="attr_name">
          <el-input v-model="addManyForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addManyDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="submitAddManyForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加静态属性对话框 -->
    <el-dialog
      title="添加动态参数"
      :visible.sync="addOnlyDialogVisble"
      width="60%"
      @close="closeAddOnlyDialog"
    >
      <!-- 添加静态属性参数表单区域 -->
      <el-form
        ref="addOnlyFormRef"
        :model="addOnlyForm"
        :rules="addOnlyFormRules"
        label-width="100px"
      >
        <el-form-item label="静态属性" prop="attr_name">
          <el-input v-model="addOnlyForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addOnlyDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="submitAddOnlyForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="editText"
      :visible.sync="editDialogVisble"
      width="60%"
      @close="closeEditDialog"
    >
      <!-- 修改参数表单区域 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="editLabel" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 商品级别分类数据 cat_id cat_name cat_pid cat_level
      cateList: [],
      // 级联选择器的配置属性
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中项的值数组
      selectedValues: [],
      // 三级分类的ID 传参用
      cateId: 0,
      // 操作行参数的ID 传参用
      attrId: 0,
      // tabs标签默认活跃项
      defaultActive: 'many',
      // 表格参数数据
      paramsTableDatas: {
        // 动态参数数据
        many: [],
        // 静态属性数据
        only: []
      },
      // 添加动态属性对话框默认是否显示
      addManyDialogVisble: false,
      // 添加动态参数表单数据源
      addManyForm: {
        attr_name: ''
      },
      // 添加动态参数表单校验规则
      addManyFormRules: {
        attr_name: [
          { required: true, message: '动态参数名不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 8,
            message: '动态参数名应在2-8位之间',
            trigger: 'blur'
          }
        ]
      },
      // 添加动态属性对话框默认是否显示
      addOnlyDialogVisble: false,
      // 添加静态属性表单数据源
      addOnlyForm: {
        attr_name: ''
      },
      // 添加静态属性表单校验规则
      addOnlyFormRules: {
        attr_name: [
          { required: true, message: '动态参数名不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 8,
            message: '动态参数名应在2-8位之间',
            trigger: 'blur'
          }
        ]
      },
      // 修改参数对话框默认是否显示
      editDialogVisble: false,
      // 修改参数表单数据源
      editForm: {
        attr_name: ''
      },
      // 修改参数表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '参数名不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 8,
            message: '参数名应在2-8位之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    // 获取商品级别分类数据
    this.getCateList()
  },
  computed: {
    // 修改参数对话框标题
    editText() {
      if (this.defaultActive === 'many') {
        return '修改动态参数'
      } else {
        return '修改静态属性'
      }
    },
    // 修改参数对话框label
    editLabel() {
      if (this.defaultActive === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    // 发送获取商品级别分类数据请求
    getCateList() {
      this.$http.get('categories').then(res => {
        // console.log(res)
        // 获取失败
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        // 获取成功
        this.cateList = res.data.data
        // console.log(this.cateList)
      })
    },
    // 级联选择器选中项发生改变事件
    handleChange() {
      console.log(this.selectedValues)
      // 判断选择项是否是三级分类
      if (this.selectedValues.length !== 3) {
        this.selectedValues = []
        this.paramsTableDatas.many = []
        this.paramsTableDatas.only = []
        return this.$message.error('请选择三级分类')
      }
      // 是三级分类的话立即请求数据
      this.getGoodsParams()
    },
    // 点击tabs标签页触发事件
    handleClick() {
      console.log(this.defaultActive)
      this.getGoodsParams()
    },
    // 获取商品参数数据请求
    getGoodsParams() {
      if (this.selectedValues.length !== 3) return
      const id = this.selectedValues[this.selectedValues.length - 1]
      this.cateId = id
      console.log(id)
      this.$http
        .get(`categories/${id}/attributes`, {
          params: { sel: this.defaultActive }
        })
        .then(res => {
          // 获取失败
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          // 获取成功
          console.log(res)
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            item.inputVisible = false
            item.inputValue = ''
            console.log(item.attr_vals)
          })
          if (this.defaultActive === 'many') {
            this.paramsTableDatas.many = res.data.data
          } else {
            this.paramsTableDatas.only = res.data.data
          }
        })
    },
    // 关闭添加动态参数对话框事件
    closeAddManyDialog() {
      this.addManyDialogVisble = false
      this.$refs.addManyFormRef.resetFields()
    },
    // 关闭添加静态属性对话框事件
    closeAddOnlyDialog() {
      this.addOnlyDialogVisble = false
      this.$refs.addOnlyFormRef.resetFields()
    },
    // 提交添加动态参数表单
    submitAddManyForm() {
      this.$refs.addManyFormRef.validate(valid => {
        if (!valid) return false
        const params = {
          attr_name: this.addManyForm.attr_name,
          attr_sel: 'many'
        }
        this.$http
          .post(`categories/${this.cateId}/attributes`, params)
          .then(res => {
            console.log(res)
            if (res.data.meta.status !== 201) {
              return this.$message.error(res.data.meta.msg)
            }
            this.addManyDialogVisble = false
            this.$message.success(res.data.meta.msg)
            this.getGoodsParams()
          })
      })
    },
    // 提交添加静态属性表单
    submitAddOnlyForm() {
      this.$refs.addOnlyFormRef.validate(valid => {
        if (!valid) return false
        const params = {
          attr_name: this.addOnlyForm.attr_name,
          attr_sel: 'only'
        }
        this.$http
          .post(`categories/${this.cateId}/attributes`, params)
          .then(res => {
            // console.log(res)
            if (res.data.meta.status !== 201) {
              return this.$message.error(res.data.meta.msg)
            }
            this.addOnlyDialogVisble = false
            this.$message.success(res.data.meta.msg)
            this.getGoodsParams()
          })
      })
    },
    // 展示修改参数对话框事件
    showEditDialog(attrId) {
      // 保存参数ID
      this.attrId = attrId
      // 发送根据ID查询参数请求
      this.$http
        .get(`categories/${this.cateId}/attributes/${attrId}`, {
          params: { attr_sel: this.defaultActive }
        })
        .then(res => {
          // 请求失败
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          // 请求成功
          this.editForm.attr_name = res.data.data.attr_name
        })
      this.editDialogVisble = true
    },
    // 关闭修改对话框事件
    closeEditDialog() {
      this.editDialogVisble = false
      this.$refs.editFormRef.resetFields()
    },
    // 提交修改表单事件
    submitEditForm() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return false
        // 通过验证发起修改参数请求
        this.$http
          .put(`categories/${this.cateId}/attributes/${this.attrId}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.defaultActive
          })
          .then(res => {
            // 请求失败
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            // 请求成功
            this.$message.success(res.data.meta.msg)
            this.getGoodsParams()
          })
      })
      this.editDialogVisble = false
    },
    // 点击 删除参数 事件
    deleteParams(attrId) {
      this.$confirm('确认要删除该参数吗？', '提醒', {
        type: 'wraning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(() => {
          this.$http
            .delete(`categories/${this.cateId}/attributes/${attrId}`)
            .then(res => {
              console.log(res)
              // 删除失败
              if (res.data.meta.status !== 200) {
                return this.$message.error(res.data.meta.msg)
              }
              // 删除成功
              this.$message.success(res.data.meta.msg)
              this.getGoodsParams()
            })
        })
        .catch(() => {
          this.$message.info('取消了删除')
        })
    },
    // 添加标签输入框的回车按键和失去焦点事件
    handleInputConfirm(rowInfo) {
      if (rowInfo.inputValue.trim().length === 0) {
        rowInfo.inputVisible = false
        rowInfo.inputValue = ''
        return false
      }
      rowInfo.attr_vals.push(rowInfo.inputValue.trim())
      rowInfo.inputVisible = false
      this.putParamsAttr(rowInfo)
    },
    // 更新参数属性(增删改除)请求
    putParamsAttr(rowInfo) {
      this.$http
        .put(`categories/${this.cateId}/attributes/${rowInfo.attr_id}`, {
          attr_name: rowInfo.attr_name,
          attr_sel: this.defaultActive,
          attr_vals: rowInfo.attr_vals.join(' ')
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.$message.success(res.data.meta.msg)
          rowInfo.inputValue = ''
        })
    },
    // 按钮切换为文本框
    showInput(rowInfo) {
      rowInfo.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // Tag关闭事件
    handleTagColse(index, rowInfo) {
      rowInfo.attr_vals.splice(index, 1)
      this.putParamsAttr(rowInfo)
    }
  }
}
</script>

<style scoped>
.cate-row {
  margin-top: 15px;
}
.el-cascader {
  margin-left: 10px;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 160px;
}
</style>
