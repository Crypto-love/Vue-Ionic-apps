<template>
  <div class="q-pt-lg">
    <q-table :data="data" row-key="order_id" :columns="columns">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="primary_text" key="id"> #{{ props.row.order_id }} </q-td>
          <q-td class="primary_text" key="customer_name" :props="props">
            {{ props.row.user_name }}
            <div class="customer_company">
              {{ !props.row.alias_name ? props.row.customer : props.row.alias_name }}
            </div>
          </q-td>
          <q-td class="primary_text">
            <div
              v-if="
                props.row.stripe_transaction_id === null ||
                props.row.paymentB2c.stripe_transaction_id === null
              "
            >
              <q-icon size="sm" name="eva-close-outline" color="grey" />
            </div>
            <div v-else>
              <q-icon size="sm" name="eva-checkmark-outline" color="primary" />
            </div>
          </q-td>
          <q-td class="primary_text" key="customer_mobile" :props="props">
            {{ props.row.mobile ? `${props.row.mobile}` : '' }}
          </q-td>
          <q-td class="primary_text" key="tenant_name" :props="props">
            <div class="primary_text">{{ props.row.tenant_name }}</div>
          </q-td>
          <q-td class="primary_text" :props="props"
            >{{ credentials.currency_symbol }}{{ props.row.prices }}</q-td
          >

          <q-td class="primary_text" key="price" :props="props"
            >{{ credentials.currency_symbol
            }}{{ $helper.customToFixed2(Number(props.row.prices) + Number(props.row.taxes)) }}</q-td
          >

          <q-td key="delivery_date" :props="props">{{
            $dayjs(props.row.delivery_date).format('D MMMM YYYY')
          }}</q-td>
          <q-td key="info" :props="props">
            <q-icon name="eva-info-outline" size="sm" />
            <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">{{
              props.row.info
            }}</q-tooltip>
          </q-td>
          <q-td key="status" :props="props">
            <q-btn-dropdown
              split
              rounded
              unelevated
              no-caps
              size="md"
              :label="capitalize(props.row.status)"
              align="center"
              id="odrStatus"
              :color="getStatusColor(props.row.status)"
              text-color="white"
              :disable="isDisable"
            >
              <q-list dense v-for="(item, index) in listStatusOrder" :key="index">
                <q-item
                  :active="props.row.status !== item.name"
                  :clickable="props.row.status !== item.name"
                  v-close-popup
                >
                  <q-item-section avatar>
                    <q-avatar class="ellips_processing" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label @click="onChangeOrderStatus(props.row, item.id)">{{
                      item.name
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
          <q-td key="action" :props="props" style="width: 32px">
            <div class="column">
              <!-- <q-btn
                flat
                round
                color="primary"
                icon="eva-clipboard-outline"
                @click="onDownloadPurchaseOrder(props.row.id)"
              >
                <q-tooltip>Download Purchase Order</q-tooltip>
              </q-btn> -->
              <q-btn
                flat
                round
                color="primary"
                @click="showOrderDetails(props.row)"
                icon="eva-file-text-outline"
              >
                <q-tooltip>Detail or Edit</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: []
    },
    columns: {
      type: Array,
      required: []
    },
    selectedTenant: {
      type: Object,
      default: {}
    },
    onDownloadPurchaseOrder: {
      type: Function,
      default: () => null
    },
    onChangeOrderStatus: {
      type: Function,
      default: () => null
    },
    isDisable: {
      type: Boolean,
      default: false
    },
    listStatusOrder: {
      type: Array,
      default: []
    },
    credentials: {
      type: Object,
      default: {}
    },
    credentials: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      showForm: false
    };
  },
  computed: {},
  created() {},
  methods: {
    showOrderDetails(val) {
      this.$emit('show-form', { showForm: true, data: val });
      // selectedItem = props.row;
      // showForm = true;
    },
    capitalize(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    },
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'processing in hub':
          return 'amber-8';
        case 'processed in hub':
          return 'cyan';
        case 'b2c processed':
          return 'primary';
        case 'b2c cancelled':
          return 'red-7';
        case 'refunded':
          return 'red-7';
        default:
          return 'grey';
      }
    }
  }
};
</script>
