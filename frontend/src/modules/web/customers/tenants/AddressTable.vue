<template>
  <div>
    <q-table :class="`${disabled && 'light-dimmed'} no-shadow`" :data="addressList" :columns="columns" dense>
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Address Information</div>
      </template>
      <template v-slot:top-right>
        <div>
          <q-btn
            no-caps
            size="11px"
            color="primary"
            @click="
              selectedItem = null;
              showForm = true;
            "
            :disable="disabled"
            >Add Address</q-btn
          >
        </div>
      </template>
      <template v-slot:body-cell-address="props">
        <q-td :props="props">{{ getFormattedAddress(props.row) }}</q-td>
      </template>
      <template v-slot:body-cell-is_default="props">
        <q-td :props="props">
          <q-icon name="eva-checkmark-outline" size="sm" color="green" v-if="props.row.is_default === true" />
          <q-icon name="eva-close-outline" size="sm" color="red" v-else />
        </q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="true"
            :false-value="false"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            class="cursor-pointer"
            size="sm"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm" persistent>
      <my-form
        :item="selectedItem"
        :cust-id="custId"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Voucher } from 'services';
import { Api, Notice } from 'services';
import MyForm from './AddressForm.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { env } from 'src/config';
import { updateMyCustomerAddress, getAddress } from 'treeGQL';

export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
      default: 0
    },
    address: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      xeroTenantId: this.$store.state.xero_tenant_id,
      showForm: false,
      selectedItem: null,
      addresses: [],
      firstLoad: true,
      columns: [
        {
          name: 'address',
          label: 'Address',
          align: 'left',
          field: 'address',
          sortable: true
        },
        {
          name: 'is_default',
          label: 'Default',
          align: 'left',
          field: 'is_default',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        },
        {
          name: 'active',
          label: 'Active',
          align: 'left',
          field: 'active',
          sortable: true
        }
      ]
    };
  },
  computed: {
    isThirdPartyAllowed() {
      return ['production', 'staging', 'testing'].includes(env);
    },
    addressList: {
      get() {
        if (this.address.length > 0 && this.firstLoad) {
          this.addresses = this.address;
          this.firstLoad = false;
        }
        return this.addresses;
      },
      set(v) {
        this.addresses = v;
      }
    }
  },
  methods: {
    async getAddress() {
      const res = await new Promise((resolve, reject) => {
        return this.$apollo
          .query({
            query: getAddress,
            variables: {
              customerId: this.custId
            }
          })
          .then((res) => {
            resolve(res?.data?.getAddress);
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
      this.addressList = res;
      return res;
    },
    async onAddComplete(newData) {
      try {
        this.$q.loading.show({ message: 'Creating Address...' });

        if (this.isThirdPartyAllowed && newData.is_default === true) {
          /** update xero contact address if this tenant already connected to xero */
          if (this.xeroTenantId) {
            await this.updateXeroContactAddress(newData);
          }
          /** update voucherify contact address */
          await this.updateVoucherifyAddress(newData);
        }
        const res = await new Promise(async (resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: updateMyCustomerAddress,
              variables: {
                data: newData
              }
            })
            .then((res) => {
              resolve(res?.data?.updateMyCustomerAddress);
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

        this.addresses = await this.getAddress();

        this.showForm = false;
        Notice.ok('Address created successfully');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onEditComplete(newData, id) {
      try {
        this.$q.loading.show({ message: 'Updating Address...' });

        if (this.isThirdPartyAllowed && newData.is_default === true) {
          /** update xero contact address */
          if (this.xeroTenantId) {
            await this.updateXeroContactAddress(newData);
          }
          /** update voucherify contact address */
          this.updateVoucherifyAddress(newData);
        }
        //remove unnecessary data
        delete newData['__typename'];

        const res = await new Promise(async (resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: updateMyCustomerAddress,
              variables: {
                data: newData
              }
            })
            .then((res) => {
              resolve(res?.data?.updateMyCustomerAddress);
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
        this.addresses = await this.getAddress();

        this.showForm = false;
        Notice.ok('Address updated successfully');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async toggleActive(row) {
      if (row.__typename) delete row['__typename'];
      if (row.country?.__typename) delete row.country['__typename'];
      console.log('row', row);
      row.active = !row.active;
      row.is_default = !row.active ? false : row.is_default;
      try {
        const res = await new Promise(async (resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: updateMyCustomerAddress,
              variables: {
                data: row
              }
            })
            .then((res) => {
              resolve(res?.data?.updateMyCustomerAddress);
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
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    getFormattedAddress(address) {
      let result = address.road ? address.road : '';

      if (address.building) {
        result = result ? result + ', ' : '';
        result += address.building;
      }

      if (!address.floor_number && address.unit) {
        result = result ? result + ', ' : '';
        result += address.unit;
      } else if (address.floor_number && !address.unit) {
        result = result ? result + ', ' : '';
        result += 'Level ' + address.floor_number;
      } else if (address.floor_number && address.unit) {
        result = result ? result + ', ' : '';
        result += '#' + address.floor_number + '-' + address.unit;
      }

      if (address.stall) {
        result = result ? result + ', ' : '';
        result += address.stall;
      }
      if (address.city) {
        result = result ? result + ', ' : '';
        result += address.city;
      }
      if (address.state) {
        result = result ? result + ', ' : '';
        result += address.state;
      }
      if (address.postal_code) {
        result = result ? result + ', ' : '';
        result += address.postal_code;
      }

      return result;
    },
    async updateVoucherifyAddress(data) {
      const res = await Api.get('customers', `id=${this.custId}`);
      if (res.status) {
        let customer = res.data[0];
        const branch = await Api.get('branches', `customer_branch_id=${this.custId}`);
        if (branch.status && branch.data.length <= 0) {
          /* this is parent */
          if (customer.customer_type_id === 2 && customer.voucherify_id) {
            /** this is customer (buyer) and should have voucherify_id */
            const voucherifyPayload = {
              address: {
                city: data.city,
                state: data.city,
                line_1: data.road,
                line_2: data.building,
                country: data.state,
                postal_code: data.postal_code
              }
            };
            const voucherifyAddress = await voucher.updateCustomer(customer.voucherify_id, voucherifyPayload);
            if (voucherifyAddress.status) {
              Notice.ok('Voucherify Address Updated');
            } else {
              Notice.fail(voucherifyAddress.message);
            }
          }
        }
      } else {
        Notice.fail(res.message);
      }
    },

    getAddressLine3(floorNumber = null, unit = null) {
      if (!floorNumber && !unit) {
        return undefined;
      } else if (!floorNumber && unit) {
        return unit;
      } else if (floorNumber && !unit) {
        return `Level ${floorNumber}`;
      } else {
        return `#${floorNumber}-${unit}`;
      }
    },

    async updateXeroContactAddress(data) {
      const res = await Api.get(
        'v_customers',
        `id=${this.custId} AND customer_tenant_id = ${this.$store.state.tenant_id}`
      );
      if (!res.status) {
        Notice.fail(res.message);
        return;
      }

      let customer = res.data[0];

      /** Check first if this customer is a branch or not. If not, then upload the xero data */
      const branch = await Api.get('branches', `customer_branch_id=${this.custId}`);

      if (!branch.status) {
        Notice.fail(branch.message);
        return;
      }

      if (branch.data.length <= 0) {
        /* it means that this customer is the parent */
        if (customer.customer_type_id === 2 && customer.xero_id) {
          /** this is customer (buyer) and should have xero_id */
          const xeroPayload = {
            contacts: [
              {
                contactID: customer.xero_id,
                addresses: [
                  {
                    addressType: 'STREET',
                    addressLine1: data.road || undefined,
                    addressLine2: data.building || undefined,
                    addressLine3: this.getAddressLine3(data.floor_number, data.unit),
                    city: data.city || undefined,
                    region: data.state || undefined,
                    postalCode: data.postal_code || undefined,
                    country: data.state || undefined
                  },
                  {
                    addressType: 'POBOX',
                    addressLine1: data.road || undefined,
                    addressLine2: data.building || undefined,
                    addressLine3: this.getAddressLine3(data.floor_number, data.unit),
                    city: data.city || undefined,
                    region: data.state || undefined,
                    postalCode: data.postal_code || undefined,
                    country: data.state || undefined
                  }
                ]
              }
            ]
          };

          const xeroContactAddress = await Api.xero('updateContact', [customer.xero_id, xeroPayload]);

          if (!xeroContactAddress.status) {
            Notice.fail(xeroContactAddress.message);
            return;
          }

          Notice.ok('Xero Contact Address Updated');
          return;
        }
      }
    }
  }
};
</script>
