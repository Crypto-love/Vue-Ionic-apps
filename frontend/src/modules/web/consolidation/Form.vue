<template>
  <form-dialog :title="getConsolidationLabel()" class="modal-lg">
    <q-stepper v-model="step" ref="stepper" color="primary" animated header-nav vertical class="no-shadow">
      <q-step
        :name="1"
        title="Driver Allocation"
        icon="eva-car-outline"
        :done="step > 1"
        :header-nav="step > 1"
      >
        <div class="q-pa-md">
          <div class="q-gutter-sm">
            <q-checkbox v-model="isChecked" label="Check for postal code allocation" color="#3ABF00" />
          </div>
        </div>
        <geo-driver-allocation v-model="driverAllocation" v-if="!isChecked" />
        <driver-allocation :ref="formRef" v-model="driverAllocation" v-else />
      </q-step>
      <q-step
        :name="2"
        title="Collection Allocation"
        icon="eva-car-outline"
        :done="step > 2"
        :header-nav="step > 2"
      >
        <collection-allocation
          :ref="formRef"
          v-model="collectionAllocation"
          :driver-allocation="driverAllocation"
        />
      </q-step>
      <q-step
        :name="3"
        title="Summary Order"
        icon="eva-clipboard-outline"
        :done="step > 3"
        :header-nav="step > 3"
      >
        <summary-order v-model="payload" :driver-allocation="driverAllocation" />
      </q-step>
    </q-stepper>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" color="red" v-close-popup />
        <q-btn flat v-if="step > 1" type="button" @click="stepBack" color="primary" label="Back" />
        <div>
          <q-btn flat :label="step < 3 ? 'Next' : 'Finish'" color="primary" @click="onSubmit" />
        </div>
      </template>
    </template>
  </form-dialog>
</template>

<script>
import { Api, Notice, isNumeric } from 'services';

export default {
  components: {
    FormDialog: () => import('web/share/partial/FormDialog.vue'),
    DriverAllocation: () => import('./DriverAllocation.vue'),
    SummaryOrder: () => import('./SummaryOrder.vue'),
    CollectionAllocation: () => import('./CollectionAllocation.vue'),
    GeoDriverAllocation: () => import('./GeoDriverAllocation.vue')
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      tab: 'postAllocation',
      submitLoading: false,
      step: 1,
      driverAllocation: {
        date: null,
        group_id: null,
        zones: [],
        tenant_id: null
      },
      collectionAllocation: [],
      payload: [],
      isChecked: true
    };
  },
  computed: {
    formRef() {
      switch (this.step) {
        case 1:
          return 'driverAllocationForm';
        case 2:
          return 'collectionAllocationForm';
        default:
          return '-';
      }
    }
  },
  watch: {
    step(v) {
      if (v < 2) {
        this.collectionAllocation = [];
      }
    }
  },
  created() {
    this.driverAllocation.date = this.item.delivery_date;
    this.driverAllocation.group_id = this.item.group_id;
    this.driverAllocation.tenant_id = this.item.tenant_id;
    if (this.item.is_consolidated === 1) {
      this.step = 3;
    }
  },
  methods: {
    stepBack() {
      this.$refs.stepper.previous();
    },
    async onSubmit() {
      let success = true;
      if (this.$refs[this.formRef]) {
        success = await this.$refs[this.formRef].$refs.form.validate();
      }
      if (success) {
        switch (this.step) {
          case 1:
            return this.submitStepOne();
          case 2:
            return this.submitStepTwo();
          case 3:
            return this.submitStepThree();
        }
      }
    },
    async submitGeoZoneAllocation() {
      const checkDriverNotSelected = this.driverAllocation.allocations.some((v) => v.user_id === null);
      if (checkDriverNotSelected) {
        Notice.warn('Please choose at least one driver');
      } else {
        const payload = {
          zones: this.driverAllocation.allocations
        };
        const res = await Api.exec('p_geo_zone_drivers', [JSON.stringify(payload)]);
        if (res.status) {
          Notice.ok('Delivery drivers updated');
          this.$refs.stepper.next();
        } else {
          Notice.fail(res.message);
        }
      }
    },
    async submitPostalAllocation() {
      const checkDriverNotSelected = this.driverAllocation.zones.findIndex((v) => v.user_id !== null);
      if (checkDriverNotSelected === -1) {
        Notice.warn('Please choose at least one driver');
      } else {
        const res = await Api.exec('p_zone_drivers', [JSON.stringify(this.driverAllocation)]);
        if (res.status) {
          Notice.ok('Delivery drivers updated');
          this.$refs.stepper.next();
        } else {
          Notice.fail(res.message);
        }
      }
    },
    async submitStepOne() {
      if (this.isChecked) {
        this.submitPostalAllocation();
      } else {
        this.submitGeoZoneAllocation();
      }
    },
    async submitStepTwo() {
      const res = await Api.exec('p_seller_drivers', [JSON.stringify(this.collectionAllocation)]);
      if (res.status) {
        Notice.ok('Collect drivers updated');
        this.$refs.stepper.next();
      } else {
        Notice.fail(res.message);
      }
    },
    async submitStepThree() {
      this.$emit('add-complete', true);
    },
    getConsolidationLabel() {
      return `Consolidation: ${this.item.delivery_date} /  Group: ${this.item.group_id} `;
    }
  }
};
</script>
