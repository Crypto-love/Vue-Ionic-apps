<template>
  <q-dialog data-cy="add-address" ref="dialog" @hide="onDialogHide" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <div class="q-gutter-sm" style="position: relative; display: flex">
        <div>
          <q-btn flat round dense icon="eva-close" class="text-black" @click="hide()" />

          <span
            class="text-black text-body"
            style="display: inline-block; font-size: 1rem; font-weight: 600; padding-top: 0.8rem"
            >{{ currentAddress ? 'Add New ' : 'Change ' }} Address</span
          >
        </div>
      </div>

      <div class="bg-white">
        <div v-if="!loadData && !errorLoadData" class="q-ma-md q-pa-md">
          <q-form ref="formAddress">
            <q-select
              v-model="address.country_id"
              ref="address.country_id"
              :options="countryOptions"
              label="Country"
              stack-label
              lazy-rules
              option-label="description"
              option-value="id"
              map-options
              emit-value
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              @input="onChangeCountry"
              @filter="filterCountry"
              :rules="[(val) => !!val || 'Please choose something']"
            />

            <q-input
              v-model="address.state"
              ref="address.state"
              label="State"
              :rules="[(val) => !!val || 'State cannot be empty']"
            />

            <q-input
              v-model="address.city"
              ref="address.city"
              label="City"
              :rules="[(val) => !!val || 'City cannot be empty']"
            />
            <q-input
              v-model="address.road"
              ref="address.road"
              label="Street"
              :rules="[(val) => !!val || 'Street cannot be empty']"
            />
            <q-input v-model="address.building" ref="address.building" label="Building Name" />

            <div class="row items-center">
              <q-input
                class="col"
                v-model="address.floor_number"
                ref="address.floor_number"
                label="Floor"
                prefix="#"
              />
              <div class="col-auto q-mx-md">—</div>
              <q-input class="col" v-model="address.unit" ref="address.unit" label="Unit" />
            </div>

            <q-input
              v-model="address.postal_code"
              ref="address.postal_code"
              label="Postal Code"
              type="number"
              :rules="[(val) => !!val || 'Postal code cannot be empty']"
            />

            <q-input v-model="address.stall" ref="address.stall" label="Stall" />
          </q-form>
        </div>

        <div v-else class="bg-white absolute-full flex flex-center">
          <q-spinner-tail v-if="loadData" color="primary" size="40px" />
          <q-btn
            v-if="!loadData && errorLoadData"
            flat
            rounded
            class="text-bold"
            color="primary"
            label="TRY AGAIN"
            @click="getOrderDetail"
          />
        </div>
      </div>

      <!-- For now, add CC available for TreeDots only -->
      <div class="bg-white text-white q-mx-md">
        <!-- <div class="bg-grey" style="height: 0.5px"></div> -->
        <div class="row justify-between items-center">
          <div class="text-body text-black q-my-md">Make as default address</div>
          <q-toggle
            color="primary"
            v-model="address.is_default"
            :true-value="1"
            :false-value="0"
            :disable="currentAddress && currentAddress.is_default == 1"
          />
        </div>
        <q-btn
          class="full-width q-mb-md"
          dense
          no-caps
          unelevated
          color="primary"
          label="Save Address"
          @click="submit"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notice } from 'services';

export default {
  data() {
    return {
      credentials: this.$store.state,
      loadData: false,
      errorLoadData: false,
      orderItem: {},
      receivedDialog: false,
      countries: [],
      countryOptions: [],
      address: {
        customer_id: null,
        country_id: '',
        state: '',
        city: '',
        building: null,
        road: null,
        floor_number: null,
        unit: null,
        stall: null,
        postal_code: null,
        address_type_id: 1,
        is_default: 1,
        active: 1
      }
    };
  },
  props: {
    customerId: {
      required: true
    },
    currentAddress: {
      required: false
    }
  },
  components: {},

  watch: {
    'address.state': function (val) {
      this.address.state = val ? val.removeSpecialCharacter() : '';
    },
    'address.city': function (val) {
      this.address.city = val ? val.removeSpecialCharacter() : '';
    },
    'address.building': function (val) {
      this.address.building = val ? val.removeSpecialCharacter() : '';
    },
    'address.road': function (val) {
      this.address.road = val ? val.removeSpecialCharacter() : '';
    },
    'address.unit': function (val) {
      this.address.unit = val ? val.removeSpecialCharacter() : '';
    },
    'address.stall': function (val) {
      this.address.stall = val ? val.removeSpecialCharacter() : '';
    }
  },

  created() {
    this.getCountries();

    if (this.currentAddress) this.address = { ...this.currentAddress };
    else this.address.customer_id = this.customerId;
  },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide');
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok');
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    async getCountries() {
      this.loadData = true;
      const { status, data } = await this.$api.get('countries', 'active = 1', 'id, description');

      this.loadData = false;

      if (status) {
        this.countries = data;
        this.countryOptions = [...this.countries];

        this.address.country_id = 193;
        this.address.state = 'Singapore';
        this.address.city = 'Singapore';
      }

      this.errorLoadData = !status;
    },

    filterCountry(val, update, abort) {
      if (val === '') {
        update(() => {
          this.countryOptions = this.countries;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.countryOptions = this.countries.filter((v) => v.description.toLowerCase().indexOf(needle) > -1);
      });
    },

    onChangeCountry(val) {
      this.$refs['address.country_id'].resetValidation();
      if (val === 193) {
        this.address.state = 'Singapore';
        this.address.city = 'Singapore';
      }
    },

    submit() {
      this.$refs.formAddress.validate().then((success) => {
        if (success) this.saveAddress();
      });
    },
    resetValidation() {
      this.$refs.formAddress.resetValidation();
    },

    async saveAddress() {
      this.$q.loading.show();

      const payload = { ...this.address };
      // Delete null value
      for (const i in payload) {
        if (payload[i] === null) delete payload[i];
      }

      /** update xero contact address */
      this.updateXeroContactAddress(this.address);

      const { status, message } = await this.$api.exec('p_update_address', [
        JSON.stringify(payload).replace(/'/g, '`'),
        this.$store.state.id,
        this.currentAddress ? this.currentAddress.id : null
      ]);

      this.$q.loading.hide();

      if (status) {
        Notice.ok(`Address is ${this.currentAddress ? 'updated' : 'added'}`);

        this.onOKClick();
      }
    },
    async updateXeroContactAddress(data) {
      if (this.address.is_default != 1) return;

      const res = await this.$api.get('customers', `id=${this.customerId}`);
      if (res.status) {
        let customer = res.data[0];
        const branch = await this.$api.get('branches', `customer_branch_id=${this.customerId}`);
        if (branch.status && branch.data.length <= 0) {
          /* this is parent */

          if (customer.customer_type_id === 2 && customer.xero_id) {
            /** this is customer (buyer) and should have xero_id */
            const xeroPayload = {
              Addresses: [
                {
                  AddressType: 'STREET',
                  AddressLine1: data.road,
                  AddressLine2: data.building,
                  AddressLine3: `#${data.floor_number}-${data.unit}`,
                  City: data.city,
                  Region: data.state,
                  PostalCode: data.postal_code,
                  Country: data.state /** Singapore by default for now */
                },
                {
                  AddressType: 'POBOX',
                  AddressLine1: data.road,
                  AddressLine2: data.building,
                  AddressLine3: `#${data.floor_number}-${data.unit}`,
                  City: data.city,
                  Region: data.state,
                  PostalCode: data.postal_code,
                  Country: data.state /** Singapore by default for now */
                }
              ]
            };
            const xeroContactAddress = await this.$api.update('x_contacts/', xeroPayload, customer.xero_id);
            if (xeroContactAddress.status) {
              Notice.ok('Xero Contact Address Updated');
            } else {
              Notice.fail(xeroContactAddress.message);
            }
          }
        }
      } else {
        Notice.fail(res.message);
      }
    }
  }
};
</script>
