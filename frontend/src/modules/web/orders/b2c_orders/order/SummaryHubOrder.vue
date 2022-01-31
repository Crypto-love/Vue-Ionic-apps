<template>
  <form-dialog title="Summary Hub Order" class="modal-md">
    <q-card-section>
      <div class="datepicker">
        <q-input
          rounded
          v-model="summaryDate"
          :rules="[(val) => !!val || 'Please choose something', 'date']"
          label="Delivery Date*"
        >
          <q-menu self="bottom left" v-model="showSelectDate">
            <q-date v-model="summaryDate" @input="setSearchDate" />
          </q-menu>
          <template v-slot:append>
            <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
          </template>
        </q-input>
      </div>
      <q-select
        outlined
        v-model="selectedItems"
        :options="selectItems"
        option-label="name"
        option-value="id"
        map-options
        emit-value
        use-input
        clearable
        label="Select Items *"
        dense
        @filter="filterItem"
        @input="checkDetail()"
      />

      <div class="q-pt-md">
        <q-table flat :data="data" :columns="columns" row-key="name" class="tdots-table">
          <template v-slot:top>
            <div class="text-weight-medium">Total Qty : {{ quantity }}{{ oom.toLowerCase() }}</div>
            <q-space />
            <div class="text-weight-medium">Total Weight : {{ weight }}kg</div>
          </template>
        </q-table>
      </div>
    </q-card-section>

    <template v-slot:actions>
      <template>
        <q-btn flat label="Close" class="btn-cancel q-mr-sm" v-close-popup />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormDialog from '../FormDialog';
import { Api, Notice } from 'services';
export default {
  components: {
    FormDialog
  },
  data() {
    return {
      summaryDate: null,
      selectedItems: null,
      selectItems: [],
      items: [],
      showSelectDate: false,
      oom: null,
      quantity: 0,
      weight: 0,
      contentStyle: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      },
      columns: [
        {
          name: 'buyer_name',
          required: true,
          label: 'Customer',
          align: 'left',
          field: (row) => row.buyer_name,
          format: (val) => `${val}`
        },
        { name: 'qty', align: 'center', label: 'Qty', field: 'qty' },
        { name: 'oom', align: 'center', label: 'Order Unit', field: 'oom' },
        {
          name: 'weight',
          align: 'center',
          label: 'Weight (Kg)',
          field: 'weight'
        }
      ],
      data: []
    };
  },
  computed: {
    dateFormatted() {
      return this.$dayjs(this.summaryDate).format('YYYY-MM-DD');
    }
  },
  methods: {
    filterItem(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.selectItems = this.items;
        } else if (needle.length >= 2) {
          this.selectItems = this.items.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    setSearchDate() {
      this.getOrderItem();
      this.showSelectDate = false;
    },
    async getOrderItem() {
      try {
        const res = await Api.get(
          'v_summary_order_items',
          `delivery_date = "${this.dateFormatted}"`,
          'distinct id,name',
          'name'
        );
        this.items = res.data;
        this.selectItems = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async checkDetail() {
      try {
        const res = await Api.get(
          'v_summary_order_details',
          `delivery_date = "${this.dateFormatted}" and id = ${this.selectedItems}`,
          'buyer_name,oom,qty,weight',
          'buyer_name'
        );
        this.data = res.data;
        if (this.data.length > 0) {
          this.oom = this.data[0].oom;
          for (var item of this.data) {
            this.quantity += Number(item.qty);
            this.weight += Number(item.weight);
          }
        } else {
          this.oom = null;
          this.quantity = 0;
          this.weight = 0;
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
