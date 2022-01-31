<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="name"
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Tenant</div>
      </template>
      <template v-slot:top-right>
        <q-btn
          no-caps
          class="q-ml-md"
          size="11px"
          color="primary"
          @click="
            selectedItem = null;
            showForm = true;
          "
          :disable="disabled || (data && data.length >= 1)"
          >Tag Tenant</q-btn
        >
      </template>
      <template v-slot:body-cell-contact="props">
        <q-td :props="props">
          <div>{{ props.row.pic_email }}</div>
          <div>{{ props.row.pic_phone }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            class="cursor-pointer"
            size="sm"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          />
        </q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="1"
            :false-value="0"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm" persistent full-height>
      <my-form
        :user-id="userId"
        :item="selectedItem"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './TenantForm.vue';
export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      data: [],
      columns: [
        {
          name: 'name',
          label: 'Name',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'address',
          label: 'Address',
          align: 'left',
          field: 'address',
          sortable: true
        },
        {
          name: 'contact',
          label: 'Contact',
          align: 'left',
          field: 'contact',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        },
        {
          name: 'active',
          label: 'Active',
          align: 'left',
          field: 'active',
          sortable: true
        }
      ]
    };
  },
  watch: {
    async userId(v) {
      const res = await this.getData();
      this.data = [...res.data];
    }
  },
  methods: {
    async getData(id = null) {
      let res;
      if (id) {
        return Api.get(
          'v_user_customers',
          `user_id = ${this.userId} AND id = ${id} AND customer_type_id = 3`
        );
        return res;
      }
      return Api.get(
        'v_user_customers',
        `user_id = ${this.userId}  AND customer_type_id = 3`,
        null,
        'id DESC'
      );
    },
    async onAddComplete(newData) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        let res;
        res = await Api.add('user_customers', newData);
        if (!res.status) throw new Error(res.message);

        const insertId = res.data[0].id;
        res = await this.getData(insertId);
        if (!res.status) throw new Error(res.message);

        this.data.unshift(res.data[0]);

        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onEditComplete(newData) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        let res;
        res = await Api.update('user_customers', newData, newData.id);
        if (!res.status) throw new Error(res.message);

        res = await this.getData(newData.id);
        if (!res.status) throw new Error(res.message);

        const idx = this.data.findIndex((v) => v.id === newData.id);

        this.$set(this.data, idx, { ...res.data[0] });

        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('user_customers', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
