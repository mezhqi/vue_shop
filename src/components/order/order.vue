<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="200"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template #default="slotProps">
            <el-tag type="success" v-if="slotProps.row.order_pay=='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template #default="slotProps">{{slotProps.row.create_time | fmtTime }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
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
    <!-- 修改订单地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="editAddressForm"
        ref="editAddressFormRef"
        label-width="100px"
        :rules="editAddressFormRules"
      >
        <el-form-item label="省市区/县" prop="district">
          <el-cascader
            v-model="editAddressForm.district"
            :options="address"
            :props="{ expandTrigger: 'hover' }"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="editAddressForm.detail" placeholder></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in progressData"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import address from './city_data2017_element'
export default {
  created() {
    this.getOrderList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      address: address,
      selectedKeys: [],
      addressDialogVisible: false,
      editAddressForm: { district: [], detail: '' },
      editAddressFormRules: {
        district: [
          { required: true, message: '请选择省市县/区', trigger: 'blur' }
        ],
        detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      progressDialogVisible: false,
      progressData: []
    }
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })

      if (res.meta.status != 200) {
        return this.$message.error('获取订单列表失败了')
      }

      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    handleChange() {},
    showAddressBox() {
      this.addressDialogVisible = true
    },
    addressDialogClosed() {
      this.$refs.editAddressFormRef.resetFields()
    },
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status != 200) {
        this.$message.error('获取物流信息失败')
      }
      this.progressData = res.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>


