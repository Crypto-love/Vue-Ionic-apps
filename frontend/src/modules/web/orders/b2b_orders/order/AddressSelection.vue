<template>
  <q-dialog data-cy="choose-address" ref="dialog" @hide="onDialogHide" persistent>
    <q-card style="width: 700px; max-width: 80vw">
      <div class="bg-white">
        <div class="q-gutter-sm" style="position: relative; display: flex">
          <q-btn
            flat
            round
            dense
            icon="eva-close"
            class="text-black"
            @click="hide()"
            style="display: inline-block; padding-top: 0.5rem"
          />

          <span
            class="text-black text-body"
            style="display: inline-block; font-size: 1rem; font-weight: 600; padding-top: 0.8rem"
            >{{ formattedAddressType }} Address</span
          >
        </div>
        <div class="q-mt-sm">
          <div style="padding: 0.5rem">
            <div class="my-card q-mb-sm" v-for="address in addresses" :key="address.id">
              <q-card-section class="q-pb-none">
                <!-- <q-chip size="md" style="color: #04565A; background-color: #dfffd2;">
                  Home
                </q-chip> -->
                <span style="background-color: white; color: #a2aecb" v-if="address.is_default === 1">
                  Default
                </span>
              </q-card-section>
              <q-card-section horizontal>
                <q-card-section style="width: 80%">
                  <div class="text-body1">{{ getFormattedAddress(address) }}</div>
                </q-card-section>
                <q-card-actions vertical class="justify-around q-px-md" style="width: 20%">
                  <q-radio v-model="selectedAddress" :val="address" />
                </q-card-actions>
              </q-card-section>
              <q-separator></q-separator>
              <q-card-section class="q-py-none">
                <q-btn flat color="grey-5" class="full-width" @click="showAddressForm(address)">
                  Change the Address
                </q-btn>
              </q-card-section>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white q-pa-md text-white">
        <q-btn
          class="full-width q-mb-md"
          outline
          dense
          no-caps
          unelevated
          color="primary"
          label="+ Add New Address"
          @click="showAddressForm(null)"
        />
        <q-btn
          class="full-width q-mb-md"
          dense
          no-caps
          unelevated
          color="primary"
          label="Update Information"
          @click="onUpdateInformation(selectedAddress)"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { Api, Notice } from 'services';
import AddAddress from './AddAddress';

export default {
  data() {
    return {
      dialog: false,
      credentials: this.$store.state,
      addresses: [],
      selectedAddress: null
    };
  },

  props: {
    addressType: {
      type: String,
      required: true
    },
    currentAddressId: {
      type: Number,
      default: null
    },
    companyId: {
      type: Number,
      default: null
    }
  },

  components: { AddAddress },

  computed: {
    formattedAddressType() {
      return this.addressType[0].toUpperCase() + this.addressType.substring(1);
    },

    selectedCompany() {
      return this.credentials.selectedCompany;
    }
  },

  created() {
    this.getData();
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

    showAddressForm(address) {
      this.$q
        .dialog({
          parent: this,
          component: AddAddress,
          currentAddress: address,
          customerId: this.companyId
        })
        .onOk(() => this.getData());
    },

    async getData() {
      try {
        this.$q.loading.show({ message: 'Please wait...' });
        this.addresses = await this.getAddresses();
        if (!this.currentAddressId) {
          this.selectedAddress = this.addresses[0]; // this is usually the default one, or the latest updated (if no default value specified)
        } else {
          this.selectedAddress = this.addresses.find((v) => v.id === this.currentAddressId);
        }
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    async getAddresses() {
      const res = await Api.get(
        'address',
        `customer_id = ${this.companyId} AND active = 1`,
        null,
        'is_default DESC, updated_at DESC'
      );
      if (!res.status) throw new Error(res.message);
      return res.data;
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

    onUpdateInformation(address) {
      const result = this.getFormattedAddress(address);
      this.$emit('ok', [result, address.id, address.postal_code]);
      this.hide();
    }
  }
};
</script>
