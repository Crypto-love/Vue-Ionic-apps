<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="day_id"
      dense
      :rows-per-page-options="[7]"
      :pagination.sync="pageOpt"
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Working Hours</div>
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
          >Add Working Hours</q-btn
        >
      </template>
      <template v-slot:body-cell-day="props">
        <q-td :props="props">{{ formatTime(props.row.day.description) }}</q-td>
      </template>
      <template v-slot:body-cell-open="props">
        <q-td :props="props"
          >{{ formatTime(props.row.open_hour) }}:{{ formatTime(props.row.open_minute) }}</q-td
        >
      </template>
      <template v-slot:body-cell-close="props">
        <q-td :props="props"
          >{{ formatTime(props.row.close_hour) }}:{{ formatTime(props.row.close_minute) }}</q-td
        >
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            size="sm"
            class="cursor-pointer"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          >
            <q-tooltip>Edit</q-tooltip>
          </q-icon>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <hour-form
        :cust-id="custId"
        :item="selectedItem"
        :assigned-day="assignedDay"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Notice } from 'services';
import HourForm from './HourForm.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { getHours, updateHours } from 'treeGQL';
export default {
  components: {
    HourForm
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
          name: 'open',
          label: 'Open',
          align: 'left',
          field: 'open',
          sortable: true
        },
        {
          name: 'close',
          label: 'Close',
          align: 'left',
          field: 'close',
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
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getHours,
            variables: {
              customerId: this.custId
            }
          })
          .then((res) => {
            resolve(res?.data?.getHours);
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
      this.data = [...data];
      this.assignedDay = data.map((v) => v.day_id);
    },
    formatTime(t) {
      return t ? t.toString().padStart(2, '0') : '00';
    },
    async onAddComplete(data) {
      try {
        this.$q.loading.show({
          message: 'Processing...'
        });
        const res = await this.updateHour(JSON.stringify(data));

        this.getData();
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onEditComplete(data) {
      try {
        this.$q.loading.show({
          message: 'Processing...'
        });
        const res = await this.updateHour(JSON.stringify(data).toString());
        this.getData();
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async updateHour(data) {
      try {
        return await this.$apollo
          .mutate({
            mutation: updateHours,
            variables: {
              jsonData: data
            }
          })
          .then((res) => {
            return res.data.updateHours;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>
<style scoped>
.uploader {
  min-width: 700px;
}
</style>
