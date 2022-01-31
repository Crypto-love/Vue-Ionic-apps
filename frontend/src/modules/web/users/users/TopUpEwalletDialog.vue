<template>
  <q-card padding style="width: 760px; max-width: 760px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6">Top Up E-wallet</span>
    </q-card-section>
    <q-card-section class="row q-py-sm">
      <div class="col-sm-6 col-xs-12">
        <div class="q-mb-xs">Select Source</div>
        <q-select outlined v-model="selectedOption" :options="options" label="Select Source" dense />
      </div>
    </q-card-section>
    <q-card-section class="row q-py-sm">
      <div class="col-sm-6 col-xs-12">
        <div class="q-mb-xs">Top Up Date</div>
        <q-input
          outlined
          v-model="paymentDate"
          dense
          mask="date"
          :rules="['date']"
          label="Select Payment Date"
        >
          <template v-slot:append>
            <q-icon name="calendar_today" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="paymentDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </q-card-section>
    <q-card-section class="row q-py-sm topup">
      <q-table
        :data="data"
        class="topup-table full-width"
        :pagination="pagination"
        :columns="columns"
        :loading="dataLoading"
      >
        <template v-slot:body-cell-photoProfile="props">
          <q-td :props="props">
            <q-avatar class="q-my-sm">
              <img :src="photoProfile(props.row.image)" />
            </q-avatar>
          </q-td>
        </template>
        <template v-slot:body-cell-balance="props">
          <q-td :props="props">
            <span class="text-primary text-weight-bold">
              {{
                props.row.balance !== -1
                  ? props.row.balance.toFixed(2)
                  : "User's region isn't support e-wallet"
              }}
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-topupAmount="props">
          <q-td :props="props">
            <span class="flex items-center" v-if="props.row.balance !== -1">
              $<q-input
                v-model="props.row.topupAmount"
                dense
                mask="#.##"
                fill-mask="0"
                reverse-fill-mask
                borderless
                class="q-ml-xs"
                style="box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15)"
              >
              </q-input>
            </span>
            <span v-else> Can't add Topup amount </span>
          </q-td>
        </template>
        <template v-slot:bottom-row>
          <q-tr style="border-bottom-width: 1px">
            <q-td> Total: </q-td>
            <q-td></q-td>
            <q-td></q-td>
            <q-td class="text-primary text-weight-bold">${{ totalTopUp }}</q-td>
          </q-tr>
        </template>
        <template v-slot:bottom="props">
          <div class="row col-12 t-bottom">
            <div class="col-sm-4 justify-start items-center flex">
              Page per row:
              <q-select
                class="q-ml-md t-select-row"
                borderless
                v-model="pagination.rowsPerPage"
                :options="rowsPerPageArray"
                :disable="true"
              />
            </div>
            <div class="col-4 justify-center text-center items-center flex">
              <q-btn
                icon="chevron_left"
                color="grey-8"
                round
                dense
                flat
                :disable="props.isFirstPage"
                @click="props.prevPage"
              />
              <span
                >{{ props.pagination.page }} of
                {{ Math.ceil(data.length / props.pagination.rowsPerPage) }}</span
              >
              <q-btn
                icon="chevron_right"
                color="grey-8"
                round
                dense
                flat
                :disable="props.isLastPage"
                @click="props.nextPage"
              />
            </div>
          </div>
        </template>
        <template v-slot:loading>
          <div class="full-width text-center q-py-sm">
            {{
              submitLoading
                ? `Adding credits to the virtual wallet ...`
                : `Creating a virtual wallet for the user ...`
            }}
          </div>
        </template>
      </q-table>
    </q-card-section>
    <q-card-section class="row float-right">
      <div class="q-pr-md" v-close-popup>
        <q-btn
          label="Cancel"
          text-color="grey-8"
          outline
          rounded
          class="q-px-sm text-capitalize"
          @click="$emit('close')"
        />
      </div>
      <div class="q-pl-md">
        <q-btn
          label="Top Up"
          :color="getButtonDisabled ? 'grey-8' : 'primary'"
          rounded
          :loading="submitLoading"
          class="q-px-sm text-capitalize"
          :disable="getButtonDisabled"
          @click="topUp()"
        >
          <template v-slot:loading>
            <q-spinner color="white" />
          </template>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { Notice } from 'services';
import dayjs from 'dayjs';
import { getEwalletBalance, topUpUserBalanceDonation } from 'treeGQL';
import { aws_s3_bucket_public } from 'src/config';
export default {
  components: {},
  props: {
    userLists: {
      type: [Array],
      default: null
    }
  },
  data() {
    return {
      options: [
        {
          label: 'DBS Donation 2021',
          value: 1
        },
        {
          label: 'Food Waste Program Prize Money',
          value: 2
        },
        {
          label: 'Sg GOV Suppliers Donation',
          value: 3
        }
      ],
      selectedOption: null,
      paymentDate: dayjs().format('YYYY/MM/DD'),
      data: [],
      submitLoading: false,
      dataLoading: false,
      rowsPerPageArray: [5, 10],
      pagination: {
        rowsPerPage: 5,
        page: 1
      }
    };
  },
  computed: {
    columns() {
      const res = [
        {
          name: 'photoProfile',
          align: 'left',
          label: 'Users',
          field: 'photoProfile',
          sortable: false
        },
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'full_name',
          sortable: false
        },
        {
          name: 'balance',
          align: 'left',
          label: 'Current E-Wallet Balance ',
          field: 'balance',
          sortable: false
        },
        {
          name: 'topupAmount',
          align: 'left',
          label: 'Top Up Amount',
          field: 'topupAmount',
          sortable: false
        }
      ];
      return res;
    },
    getButtonDisabled() {
      return this.selectedOption == null || Number.parseFloat(this.totalTopUp) == 0 ? true : false;
    },
    totalTopUp() {
      let totalTopUp = 0;
      this.data.map((item) => {
        totalTopUp += Number.parseFloat(item.topupAmount);
      });
      return totalTopUp.toFixed(2);
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.dataLoading = true;
      this.data = [];
      let temp = [];
      // this.pagination.rowsNumber = this.userLists.length;
      for (let i = 0; i < this.userLists.length; i++) {
        let currentBalance = 0;
        const response = await this.$apollo
          .query({
            query: getEwalletBalance,
            variables: {
              userId: this.userLists[i].id
            }
          })
          .then(async (res) => {
            currentBalance = res.data.getEwalletBalance.available;
          })
          .catch((err) => {
            currentBalance = -1;
          });
        this.userLists[i] = {
          ...this.userLists[i],
          balance: currentBalance,
          topupAmount: 0
        };
        temp.push(this.userLists[i]);
        if (i == this.userLists.length - 1) {
          this.data = temp;
        }
      }
      // this.showDataList = this.data.slice(0, 5);
      this.dataLoading = false;
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/advocate/${photoName}`;
      }
      return `${aws_s3_bucket_public}/advocate/no_image.png`;
    },
    async topUp() {
      this.submitLoading = true;
      this.dataLoading = true;
      let formdata = [];
      this.data.map((item) => {
        if (item.balance >= 0) {
          formdata.push({
            userId: item.id,
            topUpBalance: Number.parseFloat(item.topupAmount),
            campaign: this.selectedOption.label
          });
        }
      });
      try {
        await this.$apollo
          .mutate({
            mutation: topUpUserBalanceDonation,
            variables: {
              jsonTopUpData: JSON.stringify(formdata)
            }
          })
          .then(() => {
            this.submitLoading = false;
            Notice.ok('Successfully updated!');
            this.dataLoading = false;
            setTimeout(() => {
              this.$emit('close');
            }, 1000);
          });
      } catch (error) {
        Notice.fail('Failed to update!');
      }
    }
  }
};
</script>
<style scoped></style>
