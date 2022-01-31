<template>
  <div>
    <div class="row">
      <div class="col-xs-12 col-sm-8">
        <div class="row">
          <div class="col-xs-6">
            <div class="text-weight-medium">Collection Task</div>
            <q-chip class="q-mt-sm text-primary q-px-md q-ml-none" color="info" icon="eva-bookmark-outline">{{
              collectionTasks
            }}</q-chip>
          </div>
          <div class="col-xs-6">
            <div class="text-weight-medium">Drivers</div>
            <q-chip class="q-mt-sm text-primary q-px-md q-ml-none" color="info">{{
              collectionDriversCount
            }}</q-chip>
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col-xs-6">
            <div class="text-weight-medium">Delivery Task</div>
            <q-chip class="q-mt-sm q-px-md q-ml-none" color="grey-2" icon="eva-car-outline">{{
              deliveryTasks
            }}</q-chip>
          </div>
          <div class="col-xs-6">
            <div>&nbsp;</div>
            <q-chip class="q-mt-sm q-px-md q-ml-none" color="grey-2">{{ deliveryDriversCount }}</q-chip>
          </div>
        </div>
      </div>
      <div class="col-xs-12 col-sm-4">
        <div class="text-weight-medium">Items</div>
        <div class="row justify-between q-mt-sm" v-for="(v, key) in itemSummary" :key="key">
          <div class="column">{{ v.total }} {{ v.name }}</div>
        </div>
      </div>
    </div>
    <div class="q-mt-lg text-center">
      <q-btn outline rounded icon-right="eva-eye-outline" label="Show Details" @click="showForm = true" />
    </div>
    <q-dialog v-model="showForm">
      <my-form :item="driverAllocation" @submit="onSummarySubmit" />
    </q-dialog>
  </div>
</template>

<script>
import { Api } from 'services';
export default {
  props: {
    driverAllocation: {
      type: Object,
      required: true
    }
  },
  components: {
    MyForm: () => import('./SummaryEdit.vue')
  },
  data() {
    return {
      itemSummary: [],
      showForm: false,
      collectionTasks: 0,
      collectionDriversCount: 0,
      deliveryTasks: 0,
      deliveryDriversCount: 0
    };
  },
  computed: {
    deliveryDate() {
      return this.driverAllocation.date;
    },
    group_id() {
      return this.driverAllocation.group_id;
    },
    tenant_id() {
      return this.driverAllocation.tenant_id;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.getItemSummary();
      this.getTaskSummary();
    },
    onSummarySubmit() {
      this.showForm = false;
    },
    async getItemSummary() {
      /* get item count and its UOM */
      const res = await Api.get(
        'v_consolidation_item_summary',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id} and tenant_id = ${this.tenant_id}`
      );
      if (res.status) {
        this.itemSummary = res.data;
      }
    },
    async getTaskSummary() {
      /* get collecting task count */
      const resA = await Api.get(
        'v_consolidation_task_summary',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id}  and tenant_id = ${this.tenant_id}`,
        'distinct customer_seller_id,driver_collect_user_id'
      );
      if (resA.status) {
        this.collectionTasks = resA.data.length;
      }
      /* get collect driver count */
      const resB = await Api.get(
        'v_consolidation_task_summary',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id}`,
        'distinct driver_collect_user_id'
      );
      if (resB.status) {
        this.collectionDriversCount = resB.data.length;
      }
      /* get delivery task count */
      const resC = await Api.get(
        'v_consolidation_task_summary',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id}`,
        'distinct customer_buyer_id,driver_delivery_user_id'
      );
      if (resC.status) {
        this.deliveryTasks = resC.data.length;
      }
      /* get delivery driver count */
      const resD = await Api.get(
        'v_consolidation_task_summary',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id}`,
        'distinct driver_delivery_user_id'
      );
      if (resD.status) {
        this.deliveryDriversCount = resD.data.length;
      }
    }
  }
};
</script>
