<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Quotations</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
      <div class="header-right">
        <div class="row top-row" style="height: 36px">
          <div class="q-gutter-xs search-section">
            <search-input v-model="filter" label="Search" />
          </div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-actions="props">
        <div class="bg-transparent q-pt-sm row justify-center">
          <q-btn
            rounded
            unelevated
            no-caps
            no-border
            size="sm"
            color="red-8"
            label="Reject"
            class="q-mr-sm"
            @click="updateRejected(props.row)"
          />
          <q-btn
            rounded
            unelevated
            no-caps
            no-border
            size="sm"
            color="primary"
            label="Approve"
            @click="updateAproved(props.row)"
          />
        </div>
      </template>
    </q-table>
  </q-page>
</template>
<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  components: {
    SearchInput
  },
  data() {
    return {
      credentials: this.$store.state,
      showCategoryForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'customer',
          align: 'left',
          label: 'Customers',
          field: 'customer',
          sortable: true
        },
        {
          name: 'sku',
          align: 'left',
          label: 'SKU',
          field: 'sku',
          sortable: true
        },
        {
          name: 'origin_price',
          align: 'left',
          label: 'Original price',
          field: 'origin_price',
          format: (val) => `$ ${val}`,
          sortable: true
        },
        {
          name: 'price',
          align: 'left',
          label: 'Price',
          field: 'price',
          format: (val) => `$ ${val}`,
          sortable: true
        },
        {
          name: 'quoted_by',
          align: 'left',
          label: 'Quoted By',
          field: 'quoted_by',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    showDialog(title, message, onDismiss) {
      this.$q
        .dialog({
          parent: this,
          component: AlertMessage,
          title: title,
          message: message
        })
        .onDismiss(() => {
          if (onDismiss) onDismiss();
        });
    },
    async getData() {
      this.isLoading = true;
      try {
        const res = await Api.get(
          'v_quotations',
          `price is not null and approver_id is null and tenant_id = ${this.credentials.tenant_id}`,
          null,
          'id desc'
        );
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async updateAproved(row) {
      this.$q.loading.show({
        message: 'Please wait..'
      });

      try {
        const payload = {
          action_type: 1,
          quotation_id: row.id,
          price: row.price,
          user_id: this.credentials.id,
          approve: 1
        };

        const { status, message, data } = await this.$api.exec('p_approve_quotation', [
          JSON.stringify(payload)
        ]);

        this.notifyBuyer('approve_quotation', row);

        this.$q.loading.hide();

        if (!status) throw message;

        this.showDialog('Sucess', 'Quotation has been approved!');

        this.getData();
      } catch (err) {
        this.showDialog('Failed', err);
      }
    },
    async updateRejected(row) {
      this.$q.loading.show({
        message: 'Please wait..'
      });

      try {
        const payload = {
          action_type: 1,
          quotation_id: row.id,
          user_id: this.credentials.id,
          approve: 0
        };

        const { status, message, data } = await this.$api.exec('p_approve_quotation', [
          JSON.stringify(payload)
        ]);

        this.notifyBuyer('reject_quotation', row);

        this.$q.loading.hide();

        if (!status) throw message;

        this.showDialog('Sucess', 'Quotation has been rejected!');

        this.getData();
      } catch (err) {
        this.showDialog('Failed', err);
      }
    },
    async notifyBuyer(type, quotation) {
      /* Send push notification to buyer */
      const response = await this.$api.add('app_notification', {
        target_only: true,
        user_id: this.credentials.id,
        app_mode: this.$firebase.appMode(),
        notification_type: type,
        customer: quotation.customer,
        quotation_id: quotation.id,
        requestor_user_id: quotation.requestor_id
      });
    }
  }
};
</script>
