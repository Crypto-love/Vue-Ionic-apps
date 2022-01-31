<template>
  <form-card title="Download Document">
    <q-table
      class="no-shadow"
      :data="data"
      :columns="columns"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      row-key="name"
    >
      <template v-slot:body-cell-print="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="eva-cloud-download-outline"
            label="Download"
            no-caps
            @click="execPrint(props.row)"
            :disable="printLoading"
          />
        </q-td>
      </template>
    </q-table>
    <template v-slot:actions>
      <template v-if="printLoading">
        <q-spinner color="primary" size="3em" />
      </template>
      <template v-else>
        <q-btn flat label="Close" color="red" v-close-popup />
        <q-btn
          flat
          label="Download Selected"
          color="primary"
          :disable="selected.length === 0"
          @click="printSelected"
        />
      </template>
    </template>
  </form-card>
</template>

<script>
import { saveAs } from 'file-saver';
import { Api, Notice, isNumeric } from 'services';
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
      printLoading: false,
      selected: [],
      data: [],
      columns: [
        {
          name: 'name',
          label: 'Driver Name',
          align: 'center',
          field: 'name',
          sortable: true
        },
        {
          name: 'print',
          label: 'Action',
          align: 'center',
          field: 'print',
          sortable: true
        }
      ]
    };
  },
  computed: {
    dateFormatted() {
      return this.$dayjs(this.item.delivery_date).format('YYYY-MM-DD');
    },
    dateReadable() {
      return this.$dayjs(this.item.delivery_date).format('DD MMMM YYYY');
    },
    dateForFileName() {
      return this.dateFormatted.replace('-', '');
    },
    group_id() {
      return this.item.group_id;
    },
    tenant_id() {
      return this.item.tenant_id;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getSelectedString() {
      return this.selected.length === 0
        ? ''
        : `${this.selected.length} record${this.selected.length > 1 ? 's' : ''} selected of ${
            this.data.length
          }`;
    },
    async getData() {
      const { data } = await Api.get(
        'v_consolidation_print',
        `delivery_date = '${this.dateFormatted}' and group_id = ${this.group_id} and tenant_id = ${this.tenant_id}`
      );
      this.data = [...data];
    },
    async printConsolidation(data) {
      const res = await Api.add('consolidation_all', {
        userId: data.user_id,
        deliveryDate: this.dateFormatted,
        groupId: this.group_id,
        tenantId: this.tenant_id
      });

      if (!res.status) throw new Error(res.message);

      if (res.data[0].file_buffer) {
        const uint = new Uint8Array(res.data[0].file_buffer.data);
        const blob = new Blob([uint], {
          type: 'application/octet-stream'
        });
        saveAs(blob, res.data[0].file_name);
      }

      return 'Done Processing';
    },
    async printSelected() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        for (let data of this.selected) {
          await this.print(data);
        }
      } catch (error) {
        Notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async execPrint(data) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.print(data);
      } catch (error) {
        Notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async print(data) {
      return Promise.all([this.printConsolidation(data)]);
    }
  }
};
</script>
