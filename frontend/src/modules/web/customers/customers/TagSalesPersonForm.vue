<template>
  <form-card title="Tag Sales Person" style="height: 200px; width: 480px; min-width: unset; overflow: hidden">
    <q-form @submit.prevent="onSubmit" id="spForm" class="text-center">
      <q-select
        outlined
        v-model="userId"
        :options="salesPerson"
        label="Select Sales Person"
        option-label="name"
        option-value="id"
        map-options
        emit-value
        dense
        lazy-rules
        :rules="[(val) => !!val || 'Please choose sales person']"
      />
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Cancel" v-close-popup class="text-red" />
      <q-btn flat label="Save" color="primary" type="submit" form="spForm" />
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import { Api } from 'services';
import { isEmailValid, isNumeric } from 'services';
export default {
  components: {
    FormCard
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      customerId: null,
      parentId: null,
      salesPerson: [],
      userCustomerId: null,
      userId: null
    };
  },
  mounted() {
    const { id, parentId } = this.item;
    this.customerId = id;
    this.parentId = parentId || null;
    this.getData();
  },
  methods: {
    async getData() {
      await this.getSalesPerson();
      await this.getTagged();
    },
    async getSalesPerson() {
      const { data } = await Api.get(
        'v_user_customer_name',
        `user_type_id = 7 AND customer_type_id = 3 AND tenant_id = ${this.$store.state.tenant_id}`,
        'user_id AS id, user_full_name AS `name`'
      );
      this.salesPerson = [...data];
    },
    async getTagged() {
      const tenantSalesPersonIds = this.salesPerson?.map((v) => v.id) || [];
      if (tenantSalesPersonIds.length === 0) return;

      const { data } = await Api.get(
        'v_user_customer_name',
        `customer_id = ${
          this.customerId
        } AND user_type_id = 7 AND user_id in (${tenantSalesPersonIds.toString()})`
      );
      if (data.length > 0) {
        this.userId = data[0].user_id;
        this.userCustomerId = data[0].id;
      }
    },
    onSubmit() {
      if (this.userCustomerId) {
        const payload = {
          parent_id: this.parentId,
          customer_id: this.customerId,
          userCustomerId: this.userCustomerId,
          user_id: this.userId
        };
        this.$emit('edit-complete', payload);
      } else {
        const payload = {
          parent_id: this.parentId,
          customer_id: this.customerId,
          user_id: this.userId
        };
        this.$emit('add-complete', payload);
      }
    }
  }
};
</script>
