<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="name"
      dense
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Branch Information</div>
      </template>

      <template v-slot:top-right>
        <q-btn
          class="q-ml-md"
          size="11px"
          no-caps
          color="primary"
          @click="
            selectedItem = null;
            showForm = true;
          "
          :disable="disabled"
          >Add Branch</q-btn
        >
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
    </q-table>
    <q-dialog v-model="showForm" persistent>
      <my-form
        :item="selectedItem"
        :cust-id="custId"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
        :customer-type="customerType"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './BranchForm';
export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    custId: {
      type: Number,
      default: null
    },
    customerType: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      columns: [
        {
          name: 'account_number',
          label: 'Account Number',
          align: 'left',
          field: 'account_number',
          sortable: true
        },
        {
          name: 'name',
          label: 'Branch Name',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left'
        },
        {
          name: 'active',
          label: 'Active',
          align: 'left'
        }
      ],
      tenantId: this.$store.state.tenant_id
    };
  },
  computed: {
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    }
  },
  methods: {
    async onAddComplete(newData) {
      try {
        /**
         * This payload for inserting data to table "branches"
         */
        const payload = {
          customer_id: this.custId,
          customer_branch_id: newData.customer_id,
          active: 1
        };

        const res = await Api.add('branches', payload);
        if (res.status) {
          /** inherit account_number & xero_id if parent have any */
          const parent = await Api.get(
            'v_customers',
            `id=${payload.customer_id} AND customer_tenant_id = ${this.tenantId}`
          );

          if (parent.status && parent.data.length > 0) {
            let parentCompany = parent.data[0];
            await Api.update(
              'customers',
              {
                account_number: parentCompany.account_number,
                xero_id: parentCompany.xero_id
              },
              payload.customer_branch_id
            );

            if (parentCompany.xero_id) {
              const { status, message, data } = await Api.get(
                'customer_tenants',
                `customer_id = ${newData.customer_id} AND tenant_id = ${this.tenantId}`
              );

              if (status && data && data.length > 0) {
                await Api.update(
                  'customer_tenants',
                  {
                    xero_customer_id: parentCompany.xero_id,
                    credit_term: parent.credit_term,
                    payment_type: parent.payment_type
                  },
                  data[0].id
                );
              } else {
                Notice.fail(message);
              }
            }

            /** inlude parent account number */
            newData.account_number = parentCompany.account_number;
          }

          this.tagSalesPerson(newData, () => {
            newData.id = res.data[0].id;
            this.data.push(newData);
            this.showForm = false;
          });

          Notice.ok('Branch updated');
        } else {
          Notice.fail(res.message);
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    async onEditComplete(newData, branchTableId) {
      try {
        /** This is payload for table "branches" */
        const payload = {
          customer_id: this.custId,
          customer_branch_id: newData.customer_id
        };
        const res = await Api.update('branches', payload, branchTableId);

        this.untagSalesPerson(newData, () => {
          const idx = this.data.findIndex((v) => v.id === this.selectedItem.id);
          this.$set(this.data, idx, newData);
          this.showForm = false;
        });
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    async tagSalesPerson(newData, onSuccess) {
      try {
        const { status, message, data } = await Api.get(
          'v_user_customer_name',
          `customer_id = ${this.custId} AND user_type_id = 7`
        );

        // If head company has sales person, tag branch to that sales person
        if (data.length > 0) {
          const payload = {
            user_id: data[0].user_id,
            customer_id: newData.customer_id
          };

          const res = await Api.exec('p_tag_customer', [
            data[0].user_id, // Sales person user id
            newData.customer_id // Customer branch id
          ]);
        }

        if (onSuccess) onSuccess();
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    async untagSalesPerson(newData, onSuccess) {
      try {
        // 1. Find sales person of head company
        const { status, message, data } = await Api.get(
          'v_user_customer_name',
          `customer_id = ${this.custId} AND user_type_id = 7`
        );

        if (!status) throw message;

        if (data.length > 0) {
          const salesPersonUserId = data[0].user_id;

          // 2. Check previous branch has sales person same as head company
          const response = await Api.get(
            'v_user_customer_name',
            `customer_id = ${this.selectedItem.customer_id}  AND user_id = ${salesPersonUserId} AND user_type_id = 7`
          );

          if (!response.status) throw response.message;

          // 3. Untag previous branch from sales person
          if (response.data.length > 0) {
            const userCustomerId = response.data[0].id;

            const res = await Api.update('user_customers', { active: false }, userCustomerId);

            if (!res.status) throw res.message;
          }
        }

        //4 Tag new branch to sales person
        this.tagSalesPerson(newData, onSuccess);
      } catch (error) {
        Notice.fail(error);
      }
    },

    async toggleActive(row) {
      /**
       * When we're toggling active status for these branches,
       * we're updating table customers, not branches.
       * active status on table branches is always 1.
       */
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('customers', { active: newVal }, row.customer_id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
