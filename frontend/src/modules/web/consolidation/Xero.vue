<template>
  <form-card title="Xero Invoices">
    <q-table
      class="no-shadow"
      :loading="isLoading"
      :data="filteredData"
      :columns="columns"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      :selected.sync="selected"
      row-key="invoice_number"
      virtual-scroll
      table-style="max-height: 395px"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
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
            @click="uploadInvoicesToXero([props.row])"
          />
          <q-btn
            outline
            dense
            round
            color="primary"
            icon="eva-edit"
            no-caps
            type="a"
            :href="getUrl(props.row.xero_invoice_id)"
            target="_blank"
            :disable="props.row.xero_invoice_id === null"
            :loading="uploadLoading"
          />
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
          label="Upload Selected"
          color="primary"
          :disable="selected.length === 0"
          @click="uploadInvoicesToXero(selected)"
        />
      </template>
    </template>

    <q-dialog v-model="showDetailUploadStatus">
      <q-card>
        <q-tabs
          v-model="tab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          outside-arrows
          mobile-arrows
        >
          <q-tab name="pass" label="Pass" />
          <q-tab name="fail" label="Fail" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated style="height: 50vh; width: 500px" class="scroll">
          <q-tab-panel name="pass">
            <ul>
              <li v-for="(invoice_number, index) in passInvoiceNumbers" :key="index">
                {{ invoice_number }}
              </li>
            </ul>
          </q-tab-panel>

          <q-tab-panel name="fail">
            <ul>
              <li v-for="(invoice_number, index) in failInvoiceNumbers" :key="index">
                {{ invoice_number }}
              </li>
            </ul>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </form-card>
</template>

<script>
import { Api, Notice } from 'services';
import { getConsolidationInvoices, uploadInvoicesToXero } from 'components/services/share/src/graphql';

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
      isLoading: false,
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
      pagination: {
        rowsPerPage: 0
      },
      columns: [
        {
          name: 'invoice_number',
          label: 'Invoice',
          align: 'center',
          field: 'invoice_number',
          sortable: true
        },
        {
          name: 'buyer_name',
          label: 'Customer',
          align: 'center',
          field: 'buyer_name',
          sortable: true
        },
        {
          name: 'amount',
          label: 'Amount',
          field: 'amount',
          align: 'center',
          sortable: true
        },
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          field: 'action',
          sortable: true
        }
      ],
      showDetailUploadStatus: false,
      passInvoiceNumbers: [],
      failInvoiceNumbers: [],
      tab: 'pass'
    };
  },
  computed: {
    group_id() {
      return this.item.group_id;
    },
    tenant_id() {
      return this.item.tenant_id;
    }
    // dateFormatted() {
    //   return this.$dayjs(this.item.delivery_date).format('YYYY-MM-DD');
    // }
  },
  watch: {
    selectedFilter(v) {
      switch (v) {
        case 'uploaded':
          this.filteredData = this.data.filter((v) => v.xero_invoice_id !== null);
          break;
        case 'not_uploaded':
          this.filteredData = this.data.filter((v) => v.xero_invoice_id === null);
          break;
        default:
          this.filteredData = [...this.data];
          break;
      }
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

    getUrl(url) {
      return `https://go.xero.com/AccountsReceivable/Edit.aspx?InvoiceID=${url}`;
    },

    /* TODO: Will delete commented functions below when there is no issue uploading invoice with graphql API */

    // async getData() {
    //   this.isLoading = true;
    //   const { data } = await Api.get(
    //     'v_consolidation_xero_invoices',
    //     `delivery_date='${this.dateFormatted}' and group_id=${this.group_id} and tenant_id = ${this.tenant_id}`
    //   );
    //   this.data = data;
    //   this.filteredData = [...this.data];
    //   this.isLoading = false;
    // },

    // /**
    //  * Catch the error here, So it won't distrupt the whole loop
    //  */
    // async upload(invoiceId) {
    //   const newXeroInvoice = await this.uploadToXero(invoiceId);
    //   await this.updateOrderStatus(invoiceId, newXeroInvoice);
    // },

    // async uploadSelected() {
    //   let nInvoiceUploaded = 0;
    //   try {
    //     this.uploadLoading = true;

    //     for (let data of this.selected) {
    //       this.$q.loading.show({ message: `Uploading ${data.invoice_number}` });

    //       await this.upload(data.id)
    //         .then(() => {
    //           nInvoiceUploaded++;
    //         })
    //         .catch((error) => {
    //           Notice.fail(`Error uploading ${data.invoice_number}: Please refresh and check console`);
    //         }); // If error occured on this function, it will not interrupt the loop. So other invoice can still be uploaded
    //     }
    //     Notice.ok(`${nInvoiceUploaded} Invoice(s) uploaded`);
    //     this.getData();
    //   } catch (error) {
    //     Notice.fail(error.message);
    //   } finally {
    //     this.uploadLoading = false;
    //     this.$q.loading.hide();
    //   }
    // },

    // async uploadSingle(invoiceId) {
    //   try {
    //     this.uploadLoading = true;
    //     const newXeroInvoice = await this.uploadToXero(invoiceId);
    //     await this.updateOrderStatus(invoiceId, newXeroInvoice);
    //     Notice.ok('Invoice uploaded');
    //     this.getData();
    //   } catch (error) {
    //     Notice.fail(error.message);
    //   } finally {
    //     this.uploadLoading = false;
    //   }
    // },

    // getInvoiceNumber(invoiceNumber) {
    //   switch (env) {
    //     case 'development':
    //       return `INV-${Date.now()}-DEV`;
    //     case 'testing':
    //       return `INV-${Date.now()}-TESTING`;
    //     case 'staging':
    //       return `INV-${Date.now()}-STAGING`;
    //     default:
    //       return invoiceNumber;
    //   }
    // },

    // async getInvoiceDetailById(invoiceId) {
    //   const res = await Api.exec('p_get_invoice_by_id', [invoiceId], 'read');
    //   if (!res.status) throw new Error(res.message);
    //   if (res.data.length === 0) throw new Error('Invoice not found');
    //   return res.data[0];
    // },

    // async uploadToXero(invoiceId) {
    //   const data = await this.getInvoiceDetailById(invoiceId);
    //   if ([null, 'null', 'NULL'].includes(data.xero_id)) {
    //     throw new Error(`${data.buyer_name} has invalid Xero Customer ID`);
    //   }

    //   let items = data.order_items.map((x) => {
    //     return {
    //       description: `${x.sku_code} : ${x.sku}`,
    //       unitAmount: this.$helper.display4DpPrice(x.total_price / x.qty),
    //       lineAmount: this.$helper.display4DpPrice(x.total_price),
    //       quantity: x.qty,
    //       taxAmount: this.$helper.display4DpPrice(x.tax),

    //       accountCode: 300 // This need to be dynamic in the future, not hardcoded like this. Because not every tenant can have accountCode of 300
    //     };
    //   });
    //   const payload = {
    //     invoices: [
    //       {
    //         type: 'ACCREC',
    //         invoiceNumber: this.getInvoiceNumber(data.invoice_number),
    //         reference: data.po_number,
    //         contact: { contactID: data.xero_id },
    //         lineAmountTypes: 'Exclusive',
    //         lineItems: items,
    //         currencyCode: 'SGD',
    //         date: data.delivery_date,
    //         dueDate: this.formatMysqlDueDate(data.due_date),
    //         status: ['staging', 'production'].includes(env) ? 'AUTHORISED' : 'DRAFT',
    //         brandingThemeID:
    //           data.tenant_id == 1 && env == 'production' ? 'eff2128e-db68-47ca-b5aa-75c38562bb08' : null
    //       }
    //     ]
    //   };

    //   let res;
    //   if (!data.xero_invoice_id) {
    //     /** createInvoices */
    //     res = await Api.xero('createInvoices', [payload, null, 4]);
    //   } else {
    //     /** updateInvoice */
    //     res = await Api.xero('updateInvoice', [data.xero_invoice_id, payload]);
    //   }

    //   if (!res.status) {
    //     throw new Error(`Error on ${data.invoice_number}: ${res.message}`);
    //   }
    //   if (res.data.length === 0) throw new Error(`Error on ${data.invoice_number}: No invoices uploaded`);
    //   if (res.data[0].invoices.length === 0)
    //     throw new Error(`Error on ${data.invoice_number}: No invoices uploaded`);

    //   const uploadedInvoice = res.data[0].invoices[0];
    //   uploadedInvoice.creditTerm = data.credit_term;
    //   uploadedInvoice.paymentType = data.payment_type;

    //   return uploadedInvoice;
    // },

    // async updateOrderStatus(invoiceId, xeroInvoice) {
    //   const xeroPayload = {
    //     id: invoiceId,
    //     invoice_id: xeroInvoice.invoiceID,
    //     last_user_id: this.credentials.id
    //   };
    //   const res = await Api.exec('p_xeros', [JSON.stringify(xeroPayload)]);
    //   if (!res.status) throw new Error(res.message);
    //   return res.data;
    // },

    // formatMysqlDueDate(date) {
    //   return this.$dayjs(date).format('YYYY-MM-DD');
    // }

    async getData() {
      try {
        this.isLoading = true;
        const response = await this.$apollo
          .query({
            query: getConsolidationInvoices,
            variables: {
              tenant_id: this.tenant_id,
              group_id: this.group_id,
              delivery_date: new Date(this.item.delivery_date).toISOString()
            }
          })
          .then((res) => res)
          .catch((err) => err);

        const invoices = response?.data?.getConsolidationInvoices;
        if (invoices) {
          this.data = invoices;
          this.filteredData = [...this.data];
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (err) {
        Notice.fail(err.message);
      } finally {
        this.isLoading = false;
      }
    },

    async uploadInvoicesToXero(invoices) {
      if (!invoices || invoices.length === 0) return Notice.warn('There is no invoices to be uploaded');

      try {
        this.uploadLoading = true;
        const response = await this.$apollo
          .mutate({
            mutation: uploadInvoicesToXero,
            variables: {
              tenant_id: this.tenant_id,
              invoice_ids: invoices.map((v) => v.id)
            }
          })
          .then((res) => res)
          .catch((err) => err);

        const uploadStatus = response?.data?.uploadInvoicesToXero;
        if (uploadStatus) {
          // Get data if there is uploaded invoice
          if (uploadStatus.success && uploadStatus.success.length) this.getData();

          this.showUploadStatus(uploadStatus);
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (err) {
        Notice.fail(err.message);
      } finally {
        this.uploadLoading = false;
      }
    },

    showUploadStatus(uploadStatus) {
      this.passInvoiceNumbers = uploadStatus?.success || [];
      this.failInvoiceNumbers = uploadStatus?.fail || [];

      if (this.passInvoiceNumbers.length && this.failInvoiceNumbers.length === 0) {
        return Notice.ok('Invoices are uploaded');
      } else if (this.passInvoiceNumbers.length === 0 && this.failInvoiceNumbers.length === 0) {
        return Notice.info('There is no uploaded invoice');
      }

      const action = {
        label: 'Detail',
        color: 'white',
        handler: () => (this.showDetailUploadStatus = true)
      };

      if (this.passInvoiceNumbers.length && this.failInvoiceNumbers.length) {
        this.tab = 'pass';
        return Notice.ok('Some invoices are uploaded successfully', 5000, [action]);
      } else {
        this.tab = 'fail';
        return Notice.fail('Fail to upload invoices', 5000, [action]);
      }
    }
  }
};
</script>
