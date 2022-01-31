<template>
  <form-card title="Tookan Task">
    <q-table
      class="no-shadow"
      :data="filteredData"
      :columns="columns"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      row-key="receiver"
      :filter="search"
    >
      <template v-slot:top>
        <q-select
          class="col-4"
          outlined
          v-model="selectedFilter"
          :options="filterOptions"
          label="Filter"
          dense
          stack-label
          map-options
          emit-value
        />
        <q-space />
        <q-input dense debounce="300" v-model="search" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            outline
            dense
            round
            color="primary"
            icon="eva-cloud-upload"
            no-caps
            :loading="uploadLoading"
            @click="execUpload(props.row)"
            class="q-mt-md"
          >
            <q-tooltip>Upload to Tookan</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <template v-slot:actions>
      <template v-if="uploadLoading">
        <q-spinner color="primary" size="3em" />
      </template>
      <template v-else>
        <q-btn flat label="Close" color="red" v-close-popup />
        <q-btn
          flat
          label="Upload selected"
          color="primary"
          :disable="selected.length === 0"
          @click="uploadSelected()"
        />
      </template>
    </template>
  </form-card>
</template>

<script>
import { Api, Notice, isNumeric, errorNotification } from 'services';
import { production } from 'src/config';

export default {
  components: {
    FormCard: () => import('web/share/partial/FormCard.vue')
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      uploadLoading: false,
      search: null,
      selectedFilter: 'all',
      filterOptions: [
        {
          label: 'ALL',
          value: 'all'
        },
        {
          label: 'PASS',
          value: 'uploaded'
        },
        {
          label: 'FAIL',
          value: 'not_uploaded'
        }
      ],
      selected: [],
      data: [],
      filteredData: [],
      tasks: [],
      tookanDriver: [],
      columns: [
        {
          name: 'receiver',
          label: 'Receiver',
          align: 'center',
          field: 'receiver',
          sortable: true
        },
        {
          name: 'status',
          label: 'Task',
          align: 'center',
          field: 'status',
          sortable: true
        },
        {
          name: 'fleet_id',
          label: 'Driver',
          align: 'center',
          field: 'fleet_id',
          sortable: true
        },
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          field: 'action',
          sortable: true
        }
      ]
    };
  },
  computed: {
    group_id() {
      return this.item.group_id;
    },
    tenant_id() {
      return this.item.tenant_id;
    },
    dateFormatted() {
      return this.$dayjs(this.item.delivery_date).format('YYYY-MM-DD');
    },
    dateReadable() {
      return this.$dayjs(this.item.delivery_date).format('DD MMMM YYYY');
    },
    dateForFileName() {
      return this.dateFormatted.replace('-', '');
    }
  },
  watch: {
    selectedFilter(v) {
      switch (v) {
        case 'uploaded':
          this.filteredData = this.data.filter((v) => v.job_id !== null);
          break;
        case 'not_uploaded':
          this.filteredData = this.data.filter((v) => v.job_id === null);
          break;
        default:
          this.filteredData = [...this.data];
          break;
      }
    }
  },
  mounted() {
    this.getData();
    this.getTookanDrivers();
  },
  methods: {
    formatTime(hour = null, minute = null) {
      return `${hour || '00'}:${minute || '00'}`;
    },
    getFileName(docType, driverName) {
      return `${docType}_${driverName.toLowerCase().replace(' ', '')}_${this.dateFormatted}`;
    },
    getSelectedString() {
      return this.selected.length === 0
        ? ''
        : `${this.selected.length} record${this.selected.length > 1 ? 's' : ''} selected of ${
            this.data.length
          }`;
    },
    async getData() {
      try {
        this.$q.loading.show({ message: `Please wait...` });
        const payload = {
          delivery_date: this.dateFormatted,
          group_id: this.group_id,
          tenant_id: this.tenant_id
        };
        const { data } = await Api.exec('p_get_tookans', [JSON.stringify(payload)], 'read');
        const task_status = await Api.get(
          'tookan_tasks',
          `delivery_date = '${this.dateFormatted}' and group_id = ${this.group_id}  and tenant_id = ${this.tenant_id}`
        );
        let task_details = data
          .map((x) => {
            return {
              receiver: x.receiver,
              status: x.task,
              fleet_id: x.fleet_id,
              job_id: null
            };
          })
          .filter((a, b, c) => {
            return (
              b ===
              c.findIndex(
                (x) => x.receiver === a.receiver && x.status === a.status && x.fleet_id === a.fleet_id
              )
            );
          });

        if (task_status.status && task_status.data.length > 0) {
          for (let i = 0; i < task_details.length; i++) {
            let td = task_details[i];
            let idx = task_status.data.filter(
              (s) => s.receiver === td.receiver && s.driver === td.fleet_id && s.task_type === td.status
            );
            if (idx.length > 0) {
              task_details[i].job_id = idx[0].job_id.length > 8 ? idx[0].job_id.length : null;
            }
          }
        }

        this.data = [...task_details];
        this.filteredData = [...task_details];
        this.tasks = [...data];
        this.$q.loading.hide();
      } catch (error) {
        Notice.fail(error);
        this.$q.loading.hide();
      }
    },
    async getTookanDrivers() {
      const drivers = await Api.get('t_get_all_fleets', {});
      this.tookanDriver = drivers.data;
    },
    async uploadSelected() {
      try {
        this.uploadLoading = true;
        for (let data of this.selected) {
          this.$q.loading.show({ message: `Upload task for ${data.receiver}` });
          await this.upload(data);
        }
      } catch (error) {
        Notice.fail(error);
      } finally {
        this.uploadLoading = false;
        this.$q.loading.hide();
      }
    },
    async execUpload(data) {
      try {
        this.uploadLoading = true;
        await this.upload(data);
      } catch (error) {
        Notice.fail(error);
      } finally {
        this.uploadLoading = false;
      }
    },
    async upload(data) {
      let items = this.tasks.filter((a) => {
        return a.receiver === data.receiver && a.task === data.status && a.fleet_id === data.fleet_id;
      });

      if (items.length > 0) {
        let skus = items
          .map((x) => x.sku_id)
          .filter((a, b, c) => {
            return c.indexOf(a) === b;
          });

        let remark = '';
        for (let s of skus) {
          let selected_sku = items.filter((a) => {
            return a.sku_id === s;
          });
          let total_qty = selected_sku.map((a) => a.total_qty).reduce((a, b) => a + b, 0);
          remark += `${total_qty} x ${selected_sku[0].sku}\r\n`;
        }
        let details = items[0];
        remark += details.instruction ? `Instruction:${details.instruction}` : '';
        const drivers = this.tookanDriver.filter((x) => x.name.indexOf(data.fleet_id) != -1);
        const selectedDriver = drivers[0];
        const delivery_time =
          details.delivery_time && details.delivery_time.indexOf(':') !== -1
            ? details.delivery_time.split('-')[0]
            : null;
        const close_time = `${this.dateFormatted} ${
          delivery_time ? delivery_time : details.close_time ? details.close_time : '00:00'
        }`;
        const customer = await Api.get('customer_images', `customer_id = '${details.receiver_id}'`);

        let img_customer = [];

        if (customer.data.length > 0) {
          img_customer = customer.data.map((x) => x.image.large);
        }

        let payload =
          data.status === 'collect'
            ? {
                layout_type: 0,
                auto_assignment: 0,
                timezone: -480,
                fleet_id: selectedDriver.fleet_id,
                geofence: 1,
                has_delivery: 0,
                has_pickup: 1,
                job_description: remark,
                job_pickup_address: details.address,
                job_pickup_datetime: close_time,
                job_pickup_email: details.email,
                job_pickup_name: details.receiver,
                job_pickup_phone: details.phone,
                notify: 1,
                tracking_link: 1,
                p_ref_images: img_customer
              }
            : {
                layout_type: 0,
                auto_assignment: 0,
                timezone: -480,
                fleet_id: selectedDriver.fleet_id,
                geofence: 1,
                has_delivery: 1,
                has_pickup: 0,
                job_description: remark,
                customer_address: details.address,
                job_delivery_datetime: close_time,
                customer_email: details.email,
                customer_username: details.receiver,
                customer_phone: details.phone,
                notify: 1,
                tracking_link: 1,
                p_ref_images: img_customer
              };
        const task = await Api.get('t_create_task', payload);
        const tookans = task.data[0];
        if (tookans.status && tookans.job_id) {
          Notice.ok(tookans.message);
        } else {
          Notice.fail(tookans.message);
          if (production) {
            let errorMessage = `Tookan - ${this.dateFormatted}  Group supplier ${this.group_id} - ${details.receiver}  status failed to upload`;
            await errorNotification(errorMessage, errorMessage);
          }
        }
        const payload_update = {
          delivery_date: this.dateFormatted,
          group_id: this.group_id,
          tenant_id: this.tenant_id,
          driver: data.fleet_id,
          receiver: details.receiver,
          task_type: data.status,
          job_id: tookans.job_id ? tookans.job_id : null,
          last_user_id: this.credentials.id
        };

        const result = await Api.exec('p_update_tookans', [
          JSON.stringify(payload_update).replace(/'/g, '`')
        ]);
        if (!result.status) {
          if (production) {
            let errorMessage = `Tookan (DB) - ${this.dateFormatted}  Group supplier ${this.group_id} - ${details.receiver}  status failed to upload`;
            await errorNotification(errorMessage, errorMessage);
          }
        } else {
          let task_details = [...this.data];
          if (task_details.length > 0) {
            for (let i = 0; i < task_details.length; i++) {
              let td = task_details[i];
              if (
                td.receiver === payload_update.receiver &&
                td.fleet_id === payload_update.driver &&
                td.status === payload_update.task_type
              ) {
                task_details[i].job_id =
                  payload_update.job_id && payload_update.job_id.length > 8 ? payload_update.job_id : null;
              }
            }
          }
          this.data = [...task_details];
          this.filteredData = [...task_details];
        }
      }
    }
  }
};
</script>
