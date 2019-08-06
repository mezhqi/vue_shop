<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        class="treeTable"
        :data="categoryList"
        :columns="columnsConfigs"
        show-index
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        border
        :show-row-hover="false"
      >
        <!-- <template slot="isOk" slot-scope="scope">
          <i class="el-icon-check" v-if="scope.row.cat_deleted==false"></i>
          <i class="el-icon-close" v-else></i>
        </template>-->
        <!-- 是否有效模板 -->
        <template v-slot:isOk="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted==false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序模板 -->
        <template v-slot:level="slotProps">
          <el-tag size="mini" v-if="slotProps.row.cat_level==0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="slotProps.row.cat_level==1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template v-slot:option="slotProps">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(slotProps.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="removeCategoryById(slotProps.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="30%"
      @close="addCategoryDialogClosed"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategoryList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children',checkStrictly:true }"
            @change="selectChange"
            :clearable="true"
            separator=">"
            popper-class="cascader"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCategoryDialogVisible"
      width="30%"
      @close="editCategoryDialogClosed"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCategoryList()
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3
      },
      categoryList: [],
      total: 0,
      columnsConfigs: [
        {
          label: '分类',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 当前列为模板列
          type: 'template',
          // 当前这列使用的模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 当前列为模板列
          type: 'template',
          // 当前这列使用的模板名称
          template: 'level'
        },
        {
          label: '操作',
          // 当前列为模板列
          type: 'template',
          // 当前这列使用的模板名称
          template: 'option'
        }
      ],
      addCategoryDialogVisible: false,
      addForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      },
      parentCategoryList: [],
      selectedKeys: [],
      // 修改分类
      editCategoryDialogVisible: false,
      editForm: {
        cat_name: '',
        cat_id: 0
      },
      editRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status != 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
      // pagenum从0开始的
      this.queryInfo.pagenum = res.data.pagenum + 1
      this.queryInfo.pagesize = res.data.pagesize
    },
    showAddDialog() {
      this.getParentCategoryList()
      this.addCategoryDialogVisible = true
    },
    async getParentCategoryList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status != 200) {
        return this.$message.error('获取分类列表失败')
      }
      console.log(res.data)
      this.parentCategoryList = res.data
    },
    selectChange() {
      console.log(this.selectedKeys)
    },
    async addCategory() {
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }

      const result = await this.$refs.addFormRef.validate().catch(err => err)
      if (!result) {
        return
      }
      const { data: res } = await this.$http.post('categories', this.addForm)
      if (res.meta.status != 201) {
        return this.$message.error('添加分类失败')
      }
      this.addCategoryDialogVisible = false
      this.getCategoryList()
      this.$message.success('添加分类成功')
    },
    addCategoryDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
    },
    // 页码改变
    handleCurrentChange(currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getCategoryList()
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.editForm.cat_name = res.data.cat_name
      this.editForm.cat_id = res.data.cat_id
      this.editCategoryDialogVisible = true
    },
    editCategoryDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async editCategory() {
      const { data: res } = await this.$http.put(
        'categories/' + this.editForm.cat_id,
        { cat_name: this.editForm.cat_name }
      )
      if (res.meta.status != 200) {
        return this.$message.error('修改分类失败')
      }
      this.$message.success('修改分类成功')
      this.editCategoryDialogVisible = false
      this.getCategoryList()
    },
    async removeCategoryById(id) {
      const result = await this.$confirm(
        '此操作将永久删除, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (result != 'confirm') {
        return this.$message.error('取消了删除')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('没有删除成功')
      }
      this.getCategoryList()
      this.$message.success('删除成功了')
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}

// .cascader {
//   top: 0 !important;
//   height: 500px !important;
// }
</style>


