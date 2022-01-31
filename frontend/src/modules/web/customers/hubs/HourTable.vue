<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="day"
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
import { Api, Notice } from 'services';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import HourForm from './HourForm.vue';
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
      const res = await Api.get('v_hours', `customer_id = ${this.custId}`, null, 'day_id');
      this.data = [...res.data];
      this.assignedDay = res.data.map((v) => v.day_id);
    },
    formatTime(t) {
      return t ? t.toString().padStart(2, '0') : '00';
    },
    async onAddComplete(d) {
      try {
        this.$q.loading.show({
          message: 'Processing...'
        });
        const res = await Api.exec('p_hours_add', [JSON.stringify(d)]);
        if (!res.status) {
          throw new Error(res.message);
        }
        this.getData();
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onEditComplete(d, id) {
      try {
        this.$q.loading.show({
          message: 'Processing...'
        });
        const res = await Api.update('hours', d, id);
        if (!res.status) {
          throw new Error(res.message);
        }
        this.getData();
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
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
