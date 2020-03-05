<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告框 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="stepActiveIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品信息"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs页签 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs tab-position="left" @tab-click="tabClick" :before-leave="preventCheckout">
          <!-- 基本信息tab -->
          <el-tab-pane label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="casCaderProps"
                @change="handleCascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数tab -->
          <el-tab-pane label="商品参数">
            <el-form-item v-for="item in manyAttrList" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(item2,index2) in item.attr_vals"
                  :key="index2"
                  :label="item2"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性tab -->
          <el-tab-pane label="商品属性">
            <el-form-item v-for="item in onlyAttrList" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片tab -->
          <el-tab-pane label="商品图片">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleUploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容tab -->
          <el-tab-pane label="商品内容">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加按钮 -->
            <el-button class="addBtn" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewPicDialogVisible" width="50%">
      <el-image :src="imgUrl"></el-image>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: '',
  data() {
    return {
      // 步骤条活跃索引
      stepActiveIndex: 0,
      // 级联选择框的配置
      casCaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 分类列表
      cateList: [],
      // 动态参数列表
      manyAttrList: [],
      // 静态属性列表
      onlyAttrList: [],
      // 图片上传到的后台api地址
      uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      // 预览图片对话框是否打开
      previewPicDialogVisible: false,
      // 预览图片的源地址
      imgUrl: '',
      // 添加表单的数据源
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择框被选中项的值
        goods_cat: [],
        // 图片临时路径
        pics: [],
        goods_introduce: '',
        // 包含动态参数和静态属性
        attrs: []
      },
      // 添加表单的校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 分类ID
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
      } else {
        return null
      }
    }
  },
  methods: {
    // 获取分类列表
    getCateList() {
      this.$http
        .get('categories', {
          params: {
            type: 3
          }
        })
        .then(res => {
          console.log(res)
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          this.cateList = res.data.data
        })
    },
    // 点击页签事件
    tabClick(stepInfo) {
      // console.log('阻止了切换还会触发这歌时间吗')
      if (this.addForm.goods_cat.length === 3) {
        this.stepActiveIndex = Number(stepInfo.index)
      }
      if (this.stepActiveIndex === 1) {
        this.$http
          .get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'many' }
          })
          .then(res => {
            // console.log(res)
            res.data.data.forEach(item => {
              if (item.attr_vals.length !== 0) {
                item.attr_vals = item.attr_vals.split(' ')
              } else {
                item.attr_vals = []
              }
            })
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.manyAttrList = res.data.data
            console.log(this.manyAttrList)
          })
      } else if (this.stepActiveIndex === 2) {
        this.$http
          .get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'only' }
          })
          .then(res => {
            // console.log(res)
            // res.data.data.forEach(item => {
            //   if (item.attr_vals.length !== 0) {
            //     item.attr_vals = item.attr_vals.split(' ')
            //   } else {
            //     item.attr_vals = []
            //   }
            // })
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg)
            }
            this.onlyAttrList = res.data.data
            console.log(this.onlyAttrList)
          })
      }
    },
    // 级联选择框选择项发生改变
    handleCascaderChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('只能选择三级分类')
      }
    },
    // 阻止标签页的切换(未选中分类情况下)
    preventCheckout(newActive, oldActive) {
      if (oldActive === '0' && this.addForm.goods_cat.length !== 3) {
        this.stepActiveIndex = parseInt(oldActive)
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击图片名字进行预览
    handlePreview() {
      this.previewPicDialogVisible = true
    },
    // 删除待上传图片
    handleRemove(fileInfo) {
      // console.log(fileInfo)
      const filePath = fileInfo.response.data.tmp_path
      console.log(filePath)
      const i = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.addForm.pics.splice(i, 1)
    },
    // 上传图片成功钩子
    handleUploadSuccess(res) {
      console.log(res)
      this.imgUrl = res.data.url
      const picInfo = { pic: res.data.tmp_path }
      this.addForm.pics.push(picInfo)
      this.$message.success(res.meta.msg)
    },
    // 点击添加商品按钮
    addGoods() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error('请填写必要表单项')
        // 深拷贝 以及 处理参数
        const addFormClone = _.cloneDeep(this.addForm)
        addFormClone.goods_cat = addFormClone.goods_cat.join(',')
        this.manyAttrList.forEach(item => {
          const newManyAttrList = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newManyAttrList)
        })
        this.onlyAttrList.forEach(item => {
          const newOnlyAttrList = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newOnlyAttrList)
        })
        addFormClone.attrs = this.addForm.attrs
        console.log(addFormClone)
        // 发起请求
        this.$http.post('goods', addFormClone).then(res => {
          console.log(res)
          if (res.data.meta.status !== 201) {
            return this.$message.error(res.data.meta.msg)
          }
          this.$message.success(res.data.meta.msg)
          this.$router.push('/goods')
        })
      })
    }
  }
}
</script>

<style scoped>
.el-steps {
  margin: 15px 0;
}
.el-step__title {
  font-size: 13px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-image {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>
