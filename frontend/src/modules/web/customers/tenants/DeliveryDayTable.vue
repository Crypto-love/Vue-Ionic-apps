<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="id"
      dense
      :rows-per-page-options="[7]"
      :pagination.sync="pageOpt"
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Delivery Days</div>
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
          :disable="disabled || data.length === 7"
          >Add Delivery Days</q-btn
        >
      </template>
      <template v-slot:body-cell-day="props">
        <q-td :props="props">
          {{ props.row.day.description }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="red-4" @click="onDeleteDays(props.row)" showForm="true;">
            <q-img
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/bin.png"
              style="width: 20px"
            ></q-img>
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <day-form
        :cust-id="custId"
        :item="selectedItem"
        :assigned-day="assignedDay"
        @add-complete="onAddComplete"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import DayForm from './DeliveryDayForm.vue';
import { getDeliveryDays, addDeliveryDays, deleteDeliveryDays } from 'treeGQL';
export default {
  components: {
    DayForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      data: [],
      assignedDay: [],
      pageOpt: {
        rowsPerPage: 7
      },
      columns: [
        {
          name: 'day',
          label: 'Day',
          align: 'left',
          field: 'day',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        }
      ]
    };
  },
  watch: {
    custId(v) {
      if (v) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      const res = await new Promise((resolve, reject) => {
        return this.$apollo
          .query({
            query: getDeliveryDays,
            variables: {
              tenantCustomerId: this.custId
            }
          })
          .then((res) => {
            resolve(res?.data?.getDeliveryDays);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.data = [...res];
      this.assignedDay = res.map((v) => v.day_id);
    },
    formatTime(t) {
      return t ? t.toString().padStart(2, '0') : '00';
    },
    async onAddComplete(data) {
      try {
        this.$q.loading.show({
          message: 'Processing...'
        });
        const res = await new Promise((resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: addDeliveryDays,
              variables: {
                jsonData: JSON.stringify(data)
              }
            })
            .then((res) => {
              resolve(res?.data?.addDeliveryDays);
            })
            .catch((err) => {
              reject(err.message);
            });
        });
        this.getData();
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    onDeleteDays(data) {
      if (data) {
        this.$q
          .dialog({
            title: 'Confirm',
            message: 'Would you delete item ?',
            cancel: true,
            persistent: true
          })
          .onOk(() => {
            this.updateItem(data);
          })
          .onCancel(() => {});
      } else {
        const idx = this.data.findIndex((v) => v.id === data.id);
        this.data.splice(idx, 1);
      }
    },
    async updateItem(data) {
      const res = await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: deleteDeliveryDays,
            variables: {
              jsonData: JSON.stringify(data)
            }
          })
          .then((res) => {
            resolve(res?.data?.deleteDeliveryDays);
          })
          .catch((err) => {
            reject(err.message);
          });
      });
      const idx = this.data.findIndex((v) => v.id === data.id);
      this.data.splice(idx, 1);
      this.getData();
    }
  }
};
</script>
<style scoped>
.uploader {
  min-width: 700px;
}
</style>
