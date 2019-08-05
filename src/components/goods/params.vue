<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意！只允许为第三级分类设置参数" type="warning" :closable="false" show-icon></el-alert>
      <el-row>
        <el-col>
          <span>请选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCategoryKeys"
            :options="categoryList"
            :props="props"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="btnIsDisabled" @click="addDialogVisible=true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <el-tag
                  type="primary"
                  v-for="(item ,index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(slotProps.row,index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="btnIsDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <el-tag
                  type="primary"
                  v-for="(item ,index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(slotProps.row,index)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categoryList: [],
      props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedCategoryKeys: [],
      //  被激活的tab的名称
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 修改
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          },
          { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.categoryList = res.data
    },
    // 级联选择器选项发生改变的时候触发，设置只能选择第三级分类
    handleChange() {
      this.getParamsData()
    },
    // tab 页签 单击事件
    handleClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCategoryKeys.length != 3) {
        this.selectedCategoryKeys = []
        this.onlyTableData = []
        this.manyTableData = []
        return
      }
      const { data: res } = await this.$http.get(
        `categories/${this.categoryId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status != 200) {
        return this.$message.error('获取分类属性失败')
      }
      // console.log(res.data)
      // 把attr_vals改为已,分割的数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加
    saveAddForm() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          `categories/${this.categoryId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status != 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 显示修改对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.categoryId}/attributes/${attrId}`
      )
      if (res.meta.status != 200) {
        return this.$message.error('获取分类参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    saveEditForm() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.categoryId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('修改分类参数失败')
        }
        this.$message.success('修改分类参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    async removeParams(attrId) {
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result != 'confirm') return

      const { data: res } = await this.$http.delete(
        `categories/${this.categoryId}/attributes/${attrId}`
      )

      if (res.meta.status != 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getParamsData()
    },
    async handleInputConfirm(row) {
      // 如果用户输入不合法，清空然后隐藏
      if (row.inputValue.trim().length == 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''

      this.editAttr(row)
    },
    // 新建属性值
    showInput(row) {
      row.inputVisible = true
      // 在修改数据之后立即使用它，然后等待 DOM 更新
      this.$nextTick(_ => {
        console.log(this.$refs.saveTagInput)
        console.log(this.$refs.saveTagInput.$refs.input)
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除属性值
    handleClose(row, index) {
      row.attr_vals.splice(index, 1)
      this.editAttr(row)
    },
    // 抽取修改代码
    async editAttr(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.categoryId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    }
  },
  created() {
    this.getCategoryList()
  },
  computed: {
    btnIsDisabled() {
      if (this.selectedCategoryKeys.length == 3) {
        return false
      }
      return true
    },
    // 计算属性 当前第三级分类的id
    categoryId() {
      if (this.selectedCategoryKeys.length == 3) {
        return this.selectedCategoryKeys[2]
      }
      return null
    },
    titleText() {
      return this.activeName == 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>


