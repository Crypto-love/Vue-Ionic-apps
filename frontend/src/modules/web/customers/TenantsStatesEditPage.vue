<template>
  <q-page padding>
    <div class="d_header q-mb-md q-ml-md q-mt-lg">
      <div class="row">
        <div class="col-xs-12">
          <div class="text-title text-h7">
            <span class="text-primary text-weight-medium">
              <span
                @click="gotoRoute('/main/supplier/all_supplier')"
                class="link-btn text-weight-regular cursor-pointer"
                >All Suppliers</span
              >
              /
              <span
                @click="gotoRoute(`/main/supplier/supplier/` + id)"
                class="link-btn text-weight-regular cursor-pointer"
              >
                {{ getTenantData.name }}
              </span>
              / States
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <q-table :data="data" :columns="columns" row-key="id" class="tdots-table" :loading="isLoading">
          <template v-slot:top>
            <div class="text-weight-medium text-body1">List of States</div>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                v-if="formInputs.length < 1"
                flat
                color="negative"
                icon="delete"
                @click="deleteSupplierCity(props.row.state_id)"
              />
            </q-td>
          </template>
          <template v-if="formInputs.length > 0" v-slot:bottom-row>
            <q-tr v-for="(input, index) in formInputs" :key="index">
              <q-td>
                <q-select
                  ref="input.state"
                  v-model="input.state"
                  :options="input.states_opt"
                  label="State/Province"
                  reactive-rules
                  :rules="[requiredRule]"
                />
              </q-td>
              <q-td>
                <q-btn flat color="negative" icon="cancel" @click="removeState(index)" />
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom>
            <q-tr>
              <q-td colspan="100%">
                <q-btn flat color="grey-6" @click="addState()" icon="add" label="New State" />
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row items-center q-py-sm">
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              <span>{{ message }} </span>
            </div>
            <div class="full-width row items-center q-py-sm bordered-top">
              <q-btn flat @click="addState()" icon="add" label="New State" />
            </div>
          </template>
        </q-table>
        <div v-if="formInputs.length > 0" class="full-width row q-py-xl q-gutter-sm">
          <q-btn outline rounded style="color: #04565a" label="Save" @click="createSupplierState()" />
          <q-btn outline rounded style="color: #a2acb5" label="Cancel" class="q-pl-sm" @click="reset()" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { createSupplierStates, deleteSupplierState, allStates, getSupplierStates } from 'treeGQL';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  components: {
    AlertMessage
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      formInputs: [],
      states: [],
      country_id: null,
      supplier_id: null,
      isLoading: false,
      data: []
    };
  },
  computed: {
    columns() {
      const res = [
        {
          name: 'supplier_state',
          align: 'left',
          label: 'State',
          field: 'supplier_state',
          sortable: false
        },
        {
          name: 'actions',
          align: 'right',
          label: '',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    },
    getTenantData() {
      return this.$store.state.tenantData;
    }
  },
  mounted() {
    this.country_id = this.$store.state.tenantData?.addresses?.[0]?.country_id;
    this.supplier_id = this.$store.state.tenantData?.id;
    this.getSupplierStates();
    this.getStates(this.country_id);
  },
  methods: {
    async getSupplierStates() {
      this.isLoading = true;
      this.$apollo
        .query({
          query: getSupplierStates,
          variables: {
            customer_id: this.supplier_id
          }
        })
        .then((data) => {
          this.isLoading = false;
          this.data = data.data.getSupplierStates.map((obj) => {
            return {
              supplier_state: obj.state.name,
              state_id: obj.state.id
            };
          });
        })
        .catch((error) => console.error(error));
    },
    addState() {
      if (this.$refs['input.state'] !== undefined && this.formInputs.length > 0) {
        const index = this.formInputs.length - 1;
        if (this.$refs['input.state'][index].validate()) {
          this.formInputs.push({
            state: null,
            states_opt: this.states
          });
        }
      } else {
        this.formInputs.push({
          state: null,
          states_opt: this.states
        });
      }
    },
    async getStates(country_id) {
      this.$apollo
        .query({
          query: allStates,
          variables: {
            country_id: country_id
          }
        })
        .then((data) => {
          this.states = data.data.allStates.map((state) => {
            return {
              value: state.id,
              label: state.name
            };
          });
        });
    },
    removeState(index) {
      this.formInputs.splice(index, 1);
    },
    reset() {
      this.formInputs = [];
    },
    requiredRule(val) {
      if (val === null) {
        return 'This field must not be empty';
      }
    },
    createSupplierState() {
      if (this.$refs['input.state'] !== undefined && this.formInputs.length > 0) {
        const statesHasError = this.$refs['input.state'].some((state) => {
          return state.validate() == false;
        });

        if (!statesHasError) {
          const inputs = this.formInputs.map((input) => {
            return input.state.value;
          });

          this.$apollo
            .mutate({
              mutation: createSupplierStates,
              variables: {
                supplier_id: this.supplier_id,
                states: inputs
              }
            })
            .then((data) => {
              if (data.data.createSupplierStates) {
                this.$q.notify('Succesfully added supplier states!');
                this.formInputs = [];
                this.getSupplierStates();
              } else {
                this.$q.notify('Failed to add supplier states!');
              }
            })
            .catch((error) => {
              console.error(error);
              this.$q.notify('Failed to add supplier states!');
            });
        }
      }
    },
    deleteSupplierCity(state_id) {
      this.$apollo
        .mutate({
          mutation: deleteSupplierState,
          variables: {
            supplier_id: this.supplier_id,
            state_id: state_id
          }
        })
        .then(() => {
          this.$q.notify('Succesfully deleted a state!');
          this.getSupplierStates();
        })
        .catch((error) => {
          console.error(error);
          this.$q.notify('Failed to delete the state!');
        });
    },
    gotoRoute(path) {
      this.$router.push(path);
    }
  }
};
</script>
<style scoped>
.link-btn {
  color: #a2acb5;
  text-decoration: none;
}
.link-btn:hover {
  color: var(--q-color-primary);
}
</style>
