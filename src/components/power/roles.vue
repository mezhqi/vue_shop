<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['borderBottom',i1==0 ? 'borderTop':'','verticalCenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2==0 ? '':'borderTop','verticalCenter']"
                >
                  <el-col :span="5">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
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
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot:default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog
      title="权限列表"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        default-expand-all
        show-checkbox
        node-key="id"
        :default-checked-keys="defaultCheckedArray"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRight">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form :model="editForm" :rules="addRules" ref="editFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultCheckedArray: [],
      roleId: 0,
      addRoleDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ]
      },
      editForm: {},
      editRoleDialogVisible: false
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status != 200) {
        return this.$message.error('获取角色数据失败')
      }
      this.roleList = res.data
    },
    // 删除权限
    async removeRightById(role, rightId) {
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

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status != 200) {
        return this.$message.error('没有删除成功')
      }
      role.children = res.data
      this.$message.success('删除成功了')
    },
    // 显示对话框 获取权限
    async showRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status != 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightList = res.data

      this.getKeys(role, this.defaultCheckedArray)

      this.setRightDialogVisible = true
    },
    getKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getKeys(item, arr)
      })
    },
    // 关闭对话框 重置树形控件的默认选中
    setRightDialogClosed() {
      this.defaultCheckedArray = []
    },
    async saveRight() {
      const arr = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = arr.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status != 200) {
        return this.$message.error('授权失败')
      }
      this.setRightDialogVisible = false
      this.getRoleList()
      this.$message.success('授权成功')
    },
    showAddDialog() {
      this.addRoleDialogVisible = true
    },
    async addRole() {
      const result = await this.$refs.addFormRef.validate().catch(err => err)
      if (!result) {
        return
      }
      const { data: res } = await this.$http.post('/roles', this.addForm)
      if (res.meta.status != 201) {
        return this.$message.error('添加失败')
      }
      this.addRoleDialogVisible = false
      this.getRoleList()
      this.$message.success('添加成功')
    },
    addRoleDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    async showEditDialog(roleId) {
      const { data: res } = await this.$http.get('roles/' + roleId)
      if (res.meta.status != 200) {
        return this.$message.error('获取角色失败')
      }
      this.editForm = res.data
      this.editRoleDialogVisible = true
    },
    async editRole() {
      const result = await this.$refs.editFormRef.validate().catch(err => err)
      if (!result) {
        return
      }
      const { data: res } = await this.$http.put(
        'roles/' + this.editForm.roleId,
        {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        }
      )
      console.log(res)

      if (res.meta.status != 200) {
        return this.$message.error('修改角色失败')
      }
      this.editRoleDialogVisible = false
      this.getRoleList()
      this.$message.success('修改成功')
    },
    editRoleDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async removeRoleById(roleId) {
      const result = await this.$confirm('删除角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result != 'confirm') {
        return this.$message.error('取消了删除')
      }

      const { data: res } = await this.$http.delete(`roles/${roleId}`)
      if (res.meta.status != 200) {
        return this.$message.error('没有删除成功')
      }
      this.getRoleList()
      this.$message.success('删除成功了')
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  width: 99.9%;
}

.el-tag {
  margin: 10px;
}

.borderBottom {
  border-bottom: 1px solid #eee;
}

.borderTop {
  border-top: 1px solid #eee;
}

.verticalCenter {
  display: flex;
  align-items: center;
}

.el-table {
  margin-top: 15px;
}
</style>


