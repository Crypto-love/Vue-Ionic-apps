<template>
  <form-dialog title="Add or Edit Hub Spree" class="modal-md">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-md">
        <!-- LEFT -->
        <div class="col-xs-12 col-md-12">
          <q-input
            :value="isAdmin ? this.credentials.tenant : formData.tenant.tenant_name"
            label="Choose Tenant *"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
            :disable="isEditMode ? true : isAdmin ? true : false"
            class="q-mb-sm"
          >
            <q-menu v-model="showSelectTenant">
              <choose-tenant v-model="formData.tenant" @set-tenants="setTenants" />
            </q-menu>
          </q-input>

          <q-input
            :value="formData.customer.name"
            label="Choose Hub *"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
            class="q-mb-sm"
          >
            <q-menu v-model="showSelectCustomer">
              <choose-customer
                v-model="formData.customer"
                :selectedTenant="formData.tenant"
                :isHub="true"
                @set-customer="setHubs"
              />
            </q-menu>
          </q-input>

          <div class="datepicker q-mb-sm">
            <q-tooltip v-if="isEditMode" anchor="bottom middle" self="top middle"
              >It's forbidden to change delivery date</q-tooltip
            >
            <q-input
              :disable="isEditMode || !formData.tenant.delivery_day"
              rounded
              v-model="formData.delivery_date"
              mask="date"
              :rules="[
                (val) =>
                  (!!val && get_currentday()) ||
                  `this tenant delivery day is ${
                    formData.tenant.delivery_day.length > 0
                      ? formData.tenant.delivery_day.join(',')
                      : 'not set on supplier details'
                  }`,
                'date'
              ]"
              label="Delivery Date*"
            >
              <q-menu self="bottom left" v-model="showdeliverydate">
                <q-date v-model="formData.delivery_date" :options="filterDate" @input="setDeliveryDate" />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>

          <!-- <div class="datepicker">
            <q-input
              rounded
              v-model="formData.start_date"
              mask="date"
              :rules="[
                (val) =>
                  (!!val &&
                    this.$dayjs(formData.delivery_date).diff(val, 'day') + 1 <= 7 &&
                    this.$dayjs(formData.delivery_date).diff(val, 'day') + 1 > 2 &&
                    val < this.$dayjs(formData.delivery_date).format('YYYY/MM/DD')) ||
                  'Date should less or equal to 7 days or min 2 days before delivery day',
                'date'
              ]"
              label="Open Date*"
            >
              <q-menu self="bottom left" v-model="showstartdate">
                <q-date v-model="formData.start_date" :options="filterDate" @input="setStartDate" />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div> -->
          <div class="datepicker q-mb-sm">
            <q-input
              rounded
              :disable="!formData.tenant.delivery_day"
              v-model="formData.end_date"
              mask="date"
              :rules="[
                (val) =>
                  (!!val &&
                    this.$dayjs(formData.delivery_date).diff(val, 'day') + 1 > formData.tenant.lead_time &&
                    val < this.$dayjs(formData.delivery_date).format('YYYY/MM/DD')) ||
                  `End Date min ${formData.tenant.lead_time} days before delivery day`,
                'date'
              ]"
              label="Close Date*"
            >
              <q-menu self="bottom left" v-model="showenddate">
                <q-date v-model="formData.end_date" :options="filterDate" @input="setEndDate" />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>

          <div class="timepicker">
            <q-input
              rounded
              :disable="!formData.tenant.delivery_day"
              v-model="formData.end_time"
              label="Close Time*"
            >
              <q-menu self="bottom left" v-model="showendtime">
                <q-time v-model="formData.end_time" format24h mask="HH:mm:ss" @input="setEndTime" />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>

          <!-- <div>
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Add To Table"
              no-caps
              style="width:120px height:32px"
              @click="null"
            /> 
          </div> -->
        </div>

        <!-- RIGHT -->
        <div class="col-xs-12 col-md-8"></div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn
          flat
          no-caps
          label="Cancel"
          class="btn-cancel q-mr-sm"
          :onclose="$emit('cancel')"
          v-close-popup
        />
        <q-btn flat label="Save" class="btn-save" form="myForm" type="submit" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ChooseTenant from './ChooseTenant.vue';
import ChooseCustomer from './ChooseCustomer.vue';
import { Api, Notice, isNumeric, disableYesterdayDates } from 'services';
import { helper } from 'services';
import { getAllTenantHubs } from 'treeGQL';
export default {
  components: {
    FormDialog,
    ChooseTenant,
    ChooseCustomer
  },
  props: {
    item: {
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      date: new Date(),
      submitLoading: false,
      showSelectTenant: false,
      showSelectCustomer: false,
      showdeliverydate: false,
      showstartdate: false,
      showenddate: false,
      showendtime: false,
      spree_data: [],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      formData: {
        id: null,
        tenant: {},
        customer: {},
        hub_id: null,
        delivery_date: null,
        start_date: '1988-01-01 00:00:00',
        end_date: null,
        end_time: null,
        spree_data: [] // To store only necessary items for the table
      }
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    },
    isAdmin() {
      return this.$store.state.user_type_id == 2 || this.$store.state.user_type_id == 4;
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    },
    isTenantSelected() {
      return this.formData.tenant !== null;
    }
  },
  async mounted() {
    if (this.isEditMode) {
      //sample data
      //id: 1
      // hub_id :
      // hub_name: "251 Jurong East Street 24 B2C"
      // Tenant_name: "Treedots"
      // Advocate_name: "Jurong Hub"
      // delivery_date: "2020-11-07 00:00:00"
      // start_date: "2020-11-02 00:00:00"
      // end_date: "2020-11-05 00:00:00"
      /*get tenant info*/
      try {
        let obj = {
          tenantIdList: [this.item.Tenant_id],
          hubIdList: [this.item.hub_id]
        };
        const getTenantHubs = await this.getTenantHubs(obj);
        const tenantHub = getTenantHubs.data.getTenantHubs ? getTenantHubs.data.getTenantHubs[0] : [];
        this.formData.tenant = {
          id: tenantHub.tenant_id,
          hub_id: tenantHub.customer_id,
          tenant_name: tenantHub.tenant.tenant.name,
          delivery_day: tenantHub.tenant.tenant.DeliveryDay?.sort((a, b) => a.day_id - b.day_id).map(
            (x) => x.day.description
          ),
          pic: tenantHub.tenant.first_name.concat(' ', tenantHub.tenant.last_name),
          lead_time: tenantHub.tenant.lead_days,
          email: tenantHub.tenant.email
        };
        this.formData.tenant.tenant_name = this.item.Tenant_name;
        this.formData.customer.name = this.item.hub_name;
        this.formData.customer.id = this.formData.tenant.hub_id;
        this.formData.delivery_date = this.item.delivery_date;
        this.formData.end_date = this.$dayjs(this.item.end_date).format('YYYY/MM/DD');
        this.formData.end_time = this.$dayjs(this.item.end_date).format('HH:mm:ss');
      } catch (error) {}
    } else if (this.isAdmin || this.isAdvocate) {
      /*get tenant info*/
      try {
        let obj = {};
        if (this.isAdmin) {
          obj.tenantIdList = [this.credentials.tenant_id];
        }
        if (this.isAdvocate) {
          obj.hubIdList = this.customers.map((x) => x.id);
        }
        const getTenantHubs = await this.getTenantHubs(obj);
        const tenantHub = getTenantHubs.data.getTenantHubs ? getTenantHubs.data.getTenantHubs[0] : [];
        this.formData.tenant = {
          id: tenantHub.tenant_id,
          tenant_name: tenantHub.tenant.tenant.name,
          delivery_day: tenantHub.tenant.tenant.DeliveryDay?.sort((a, b) => a.day_id - b.day_id).map(
            (x) => x.day.description
          ),
          pic: tenantHub.tenant.first_name.concat(' ', tenantHub.tenant.last_name),
          lead_time: tenantHub.tenant.lead_days,
          email: tenantHub.tenant.email
        };
      } catch (error) {
        console.log(error);
      }
    }
  },
  methods: {
    filterDate(date) {
      //next change with verify delivery day from tenant info
      return date >= this.$dayjs().add(-5, 'day').format('YYYY/MM/DD');
    },
    get_currentday() {
      if (!this.isTenantSelected) return false;
      if (this.formData.tenant.delivery_day.length === 0) return false;
      else {
        return this.formData.tenant.delivery_day
          .join(',')
          .includes(this.days[new Date(this.formData.delivery_date).getDay()])
          ? true
          : false;
      }
    },
    delete() {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      setTimeout(() => {
        const idx = this.data.findIndex((v) => v === this.selectedItem);
        this.data.splice(idx, 1);
        this.selectedItem = null;
        this.$q.loading.hide();
      }, 2000);
    },
    async onSubmit() {
      this.submitLoading = true;
      let selected_delivery_date = this.$dayjs(this.formData.delivery_date).format('YYYY-MM-DDTHH:mm:ss');
      let selected_end_date = this.$dayjs(`${this.formData.end_date} ${this.formData.end_time}`).format(
        'YYYY-MM-DDTHH:mm:ss'
      );
      //get all open spree
      const checkspreedata = await this.$api.get(
        `v_hub_spree`,
        `hub_id = '${this.formData.customer.id}' and tenant_id = '${this.formData.tenant.id}' and status = 0`
      );

      //prepare payload
      const payload = {
        advocate_id: this.credentials.id,
        hub_id: this.formData.customer.id,
        tenant_id: this.formData.tenant.id,
        delivery_date: `${selected_delivery_date}Z`,
        start_date: `1988-01-01T00:00:00Z`,
        end_date: `${selected_end_date}Z`
      };

      /* PHASE2-2154
      overlap spree
      for same tenant and same hub -> 
      check if another spree delivery_date > create/edit spree start_date or 
      another spree start_date < create/edit spree delivery_date
      otherwise
      1 week - 1 spree for 1 hub 1 tenant

      
      -- - 
      -- - else if check if delivery_date is LESS EQUAL than current week
      -- -- check if startdate bigger or equal than current date -> show alert
      -- - else
      -- -- -- check if there are already spree create for this week -> show alert
      -- -- -- else -> crete spree
      -- check if week of delivery_date is bigger current week -> update spree
      */
      if (
        checkspreedata.data.filter(
          (x) => x.end_date < selected_delivery_date && x.delivery_date === selected_delivery_date
        ).length > 0
      ) {
        this.$q.dialog({
          title: 'Invalid Spree',
          message: 'This is an active spree for the same hub and supplier',
          component: AlertMessage
        });
      } else {
        this.$emit('Create-HubSpree', payload);
      }

      this.submitLoading = false;
    },
    async getTenantHubs(obj) {
      try {
        return await this.$apollo
          .query({
            query: getAllTenantHubs,
            variables: {
              tenantId: obj.tenantIdList,
              hubId: obj.hubIdList,
              active: true
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    removeItem(id) {
      const idx = this.spree_data.findIndex((v) => v.id === id);
      this.spree_data.splice(idx, 1);
    },
    setTenants(data) {
      this.showSelectTenant = data === undefined;
      this.formData.tenant = data;
    },
    setHubs(data) {
      this.showSelectCustomer = data === undefined;
      this.formData.customer = data;
    },
    setDeliveryDate() {
      this.showdeliverydate = false;
      this.formData.start_date = null;
      this.formData.end_date = null;
    },
    setStartDate() {
      // if( (this.$dayjs(formData.delivery_date).diff(this.formData.start_date, 'day') + 1) <= 7 )
      this.showstartdate = false;
    },
    setEndDate() {
      this.showenddate = false;
    },
    setEndTime() {
      this.showendtime = false;
    },
    addtotable() {
      //not yet use
      this.spree_data = [];
    }
  }
};
</script>
