<template>
  <q-page padding>
    <q-table
      title="Consolidation"
      :data="data"
      :columns="columns"
      row-key="name"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
      grid
      hide-header
      :pagination.sync="pagination"
    >
      <template v-slot:top-right>
        <q-btn
          flat
          no-caps
          style="border-radius: 24px"
          class="btn-add q-mr-sm"
          @click="$router.push('masters/zones')"
          >Zones</q-btn
        >
        <q-btn
          flat
          no-caps
          style="border-radius: 24px"
          class="btn-add q-mr-sm"
          @click="showSellerDriverForm = true"
          >Collect Drivers</q-btn
        >
        <q-btn
          flat
          no-caps
          style="border-radius: 24px"
          class="btn-add q-mr-sm"
          @click="showZoneDriverForm = true"
          >Delivery Drivers</q-btn
        >
        <q-btn
          flat
          no-caps
          style="border-radius: 24px"
          class="btn-add q-mr-sm"
          @click="$router.push('geofencing/zones')"
          >Geo-fence</q-btn
        >
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card class="my-card" flat bordered style="border-radius: 12px">
            <q-card-section class="row">
              <div class="col">
                <div>
                  <span class="text-weight-medium text-grey">Date : &nbsp;</span>
                  <span class="text-weight-medium">{{
                    $dayjs(props.row.delivery_date).format('DD MMMM YYYY')
                  }}</span>
                </div>
                <div>
                  <span class="text-weight-medium text-grey">Group : &nbsp;</span>
                  <span class="text-weight-medium">{{ props.row.group_id }}</span>
                </div>
              </div>
              <div v-if="props.row.is_consolidated">
                <q-icon name="eva-checkmark-circle-outline" color="green" size="sm" />
              </div>
            </q-card-section>
            <q-card-section class="q-gutter-x-sm">
              <q-btn
                outline
                color="primary"
                @click="
                  selectedItem = props.row;
                  showPrintDialog = true;
                "
                icon="eva-archive-outline"
                dense
                round
              >
                <q-tooltip>Download document</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="primary"
                @click="
                  selectedItem = props.row;
                  showForm = true;
                "
                icon="eva-edit-outline"
                dense
                round
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="primary"
                @click="downloadCSV(props.row)"
                icon="eva-cloud-download-outline"
                dense
                round
                :loading="downloadInprogress"
              >
                <q-tooltip>Download csv file of picking list to supplier</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="primary"
                @click="
                  selectedItem = props.row;
                  showXeroDialog = true;
                "
                icon="eva-cloud-upload-outline"
                dense
                round
              >
                <q-tooltip>Xero</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="primary"
                @click="
                  selectedItem = props.row;
                  showTookanDialog = true;
                "
                icon="eva-people-outline"
                dense
                round
              >
                <q-tooltip>Tookan</q-tooltip>
              </q-btn>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showForm" persistent full-height>
      <my-form :item="selectedItem" @add-complete="onAddComplete" />
    </q-dialog>
    <q-dialog v-model="showPrintDialog" persistent full-height>
      <print-dialog :item="selectedItem" v-if="selectedItem" />
    </q-dialog>
    <q-dialog v-model="showXeroDialog" persistent full-height>
      <xero-dialog :item="selectedItem" v-if="selectedItem" />
    </q-dialog>
    <q-dialog v-model="showTookanDialog" persistent full-height>
      <tookan-dialog :item="selectedItem" v-if="selectedItem" />
    </q-dialog>
    <q-dialog v-model="showZoneForm" persistent full-height>
      <zone-form @add-complete="onAddZoneComplete" />
    </q-dialog>
    <q-dialog v-model="showZoneDriverForm" persistent full-height>
      <zone-driver-form />
    </q-dialog>
    <q-dialog v-model="showSellerDriverForm" persistent full-height>
      <seller-driver-form />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
export default {
  components: {
    SearchInput: () => import('web/share/partial/SearchInput.vue'),
    MyForm: () => import('./Form.vue'),
    PrintDialog: () => import('./Print.vue'),
    XeroDialog: () => import('./Xero.vue'),
    TookanDialog: () => import('./Tookan.vue'),
    ZoneForm: () => import('./Zone.vue'),
    ZoneDriverForm: () => import('./DriverAllocationDefault.vue'),
    SellerDriverForm: () => import('./CollectionAllocationDefault.vue')
  },
  data() {
    return {
      credential: this.$store.state,
      filter: '',
      selected: [],
      showZoneForm: false,
      showZoneDriverForm: false,
      showSellerDriverForm: false,
      showForm: false,
      showPrintDialog: false,
      showXeroDialog: false,
      showTookanDialog: false,
      showEditDialog: false,
      selectedItem: null,
      selectedDate: null,
      copyInprogress: false,
      downloadInprogress: false,
      xeroContacts: [],
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'delivery_date',
          field: 'delivery_date',
          sortable: true
        }
      ],
      data: []
    };
  },
  async mounted() {
    this.downloadInprogress = true;
    this.getData();
    this.xeroContacts = await this.getContacts();
    this.downloadInprogress = false;
  },
  methods: {
    async getData() {
      const { data } = await Api.get(
        'v_consolidation_items',
        `tenant_id=${this.credential.tenant_id}`,
        null,
        'delivery_date desc'
      );
      this.data = [...data];
    },
    async onAddComplete(invoicePayload) {
      this.getData();
      this.showForm = false;
    },
    async onAddZoneComplete(data) {
      const res = await Api.add('zones', data);
      if (res.status) {
        Notice.ok('New zones added');
        this.showZoneForm = false;
      } else {
        Notice.fail(res.message);
      }
    },

    async getContacts() {
      const res = await Api.xero('getContacts');
      let contacts = [];
      if (res.status && res.data.length > 0) {
        contacts = res.data[0].contacts.map((x) => {
          return {
            id: x.contactID,
            overdue: x.balances ? x.balances.accountsReceivable.overdue : 0
          };
        });
      }
      return contacts;
    },

    async downloadCSV(data) {
      try {
        this.downloadInprogress = true;
        const res = await Api.get(
          'v_picking_items',
          `delivery_date='${data.delivery_date}' and group_id=${data.group_id} and tenant_id=${this.credential.tenant_id}`,
          null,
          'buyer_name'
        );

        var csv =
          '\uFEFF' +
          'CompanyName,ItemCode,Quantity,ItemName,SupplierItemName,ItemWeight,CollectDriver,DeliveryDriver,SupplierName,CreditTerm,COD,NCND,InvoiceNumber,InvoiceAmount,AmountDue,Remark,PaidStatus\n';
        for (let x of res.data) {
          let ncnd = x.ncnd;
          let overdue_amount = 0;
          if (x.xero_id && this.xeroContacts.length > 0) {
            let contact = this.xeroContacts.filter((item) => item.id === x.xero_id);
            if (contact.length > 0) {
              overdue_amount = contact[0].overdue;
            }
            if (overdue_amount > 0 && x.ncnd === 'N') ncnd = 'Y';
          }
          let rowString = `${x.buyer_name}!${x.item_code}!${x.quantity}!${x.item_name}!${x.item_supplier_name}!${x.item_weight}!${x.collect_driver}!${x.deliver_driver}!${x.seller_name}!${x.credit_term}!${x.cod}!${ncnd}!${x.invoice_number}!${x.invoice_amount}!${overdue_amount}!${x.remark}!${x.paid_status}\n`;
          csv += rowString.replace(/(,|#)/g, '').replace(/!/g, ',');
        }
        csv += '--------------------------------------------------------------------------';
        csv = 'data:text/csv;charset=utf-8,' + csv;
        var encodedUri = encodeURI(csv);
        var link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `PICKING_${data.delivery_date}_G${data.group_id}.csv`);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.downloadInprogress = false;
      }
    }
  }
};
</script>
