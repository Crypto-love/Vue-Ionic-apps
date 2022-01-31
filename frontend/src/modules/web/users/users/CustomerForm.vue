<template>
  <form-card :title="item ? 'Edit Customer' : 'Add Customer'" class="form-card">
    <q-form @submit.prevent="onSubmit" id="customerForm">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12 col-sm-7">
          <q-select
            v-model="selectedCustomer"
            :options="filteredCustomers"
            label="Customer *"
            stack-label
            lazy-rules
            :rules="[(val) => !!val || 'Please choose something']"
            option-label="name"
            option-value="id"
            map-options
            use-input
            input-debounce
            @filter="filterCustomers"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-xs-12 col-sm-3 toggle-btn">
          <q-toggle v-model="formData.active" label="Activate" :true-value="1" :false-value="0" />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" color="red" v-close-popup />
        <q-btn flat label="Save" color="primary" type="submit" form="customerForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import { isEmailValid, isNumeric } from 'services';

export default {
  components: { FormCard },
  props: {
    userId: {
      type: Number,
      default: null
    },
    userTypeId: {
      type: Number,
      default: null
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      customers: [],
      filteredCustomers: [],
      selectedCustomer: null,
      formData: {
        user_id: null,
        customer_id: null,
        active: 1
      }
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },
  watch: {
    selectedCustomer(v) {
      this.formData.customer_id = v ? v.id : null;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.formData.user_id = this.userId;
      await this.getCustomers();
      if (this.isEditMode) {
        this.setUpEditData();
      }
    },
    setUpEditData() {
      const { id, user_id, customer_id, active } = this.item;
      this.formData = { id, user_id, customer_id, active };

      // Setup Selected Menu
      this.selectedCustomer = this.customers.find((v) => v.id === customer_id);
    },
    async getCustomers() {
      const res = await this.$api.get(
        'v_customer_branch_details',
        `customer_type_id = 2 AND tenant_id = ${this.$store.state.tenant_id} ${
          this.userTypeId == 11 ? 'AND hub= 1' : ''
        } and active = 1`
      );
      this.customers = [...res.data];
    },
    onSubmit() {
      if (this.isEditMode) {
        this.$emit('edit-complete', this.formData);
      } else {
        this.$emit('add-complete', this.formData);
      }
    },
    filterCustomers(val, update, abort) {
      if (val === '') {
        update(() => {
          this.filteredCustomers = this.customers;
        });
        return;
      }
      this.selectedCustomer = null;
      update(() => {
        const needle = val.toLowerCase();
        this.filteredCustomers = this.customers.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>

<style scoped>
.form-card {
  width: 480px !important;
  height: 220px !important;
  min-width: unset !important;
}
.toggle-btn {
  padding-top: 2.3rem;
}

@media only screen and (max-width: 600px) {
  .toggle-btn {
    padding-top: 1rem;
  }

  .form-card {
    height: 270px !important;
  }
}
</style>
