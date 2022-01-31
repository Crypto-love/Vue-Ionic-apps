<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Quotation Requests</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
    </div>
    <!-- Quotation List -->
    <q-infinite-scroll ref="infiniteScroll" @load="onLoadMore" :offset="250">
      <div v-for="(quotation, index) in quotations" :key="index" data-cy="quotation-products">
        <q-item v-if="isAdminOrSales" class="column" v-ripple>
          <div class="col q-mb-sm row justify-between">
            <div class="text-grey text-caption">
              {{ $helper.formatDateTime(quotation.created_at) }}
            </div>
            <q-btn
              v-if="quotation.quotation_status == 'pending approval'"
              dense
              no-caps
              rounded
              unelevated
              style="background-color: #dfffd2"
              size="12px"
              class="q-px-sm text-primary"
              label="Pending Approval"
              icon-right="eva-sync-outline"
            />
            <q-btn
              v-else-if="quotation.quotation_status == 'rejected'"
              dense
              no-caps
              rounded
              unelevated
              size="12px"
              style="background-color: rgba(229, 107, 104, 0.1)"
              class="q-px-sm text-red"
              label="Rejected"
              icon-right="eva-close"
            />
            <q-btn
              v-else-if="quotation.quotation_status == 'received'"
              dense
              no-caps
              rounded
              unelevated
              :ripple="false"
              style="background-color: #dfffd2"
              size="12px"
              class="q-px-md"
              text-color="primary"
              label="Received"
              icon-right="eva-checkmark-circle-outline"
            />
          </div>
          <div class="col row items-center">
            <q-avatar size="48px">
              <q-img
                :src="quotation.image_requestor ? quotation.image_requestor.small : ''"
                placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/user.svg"
              />
            </q-avatar>
            <div class="col column q-pl-md ellipsis">
              <div class="col text-weight-medium">
                {{ quotation.requestor.upFirstChar() }}
              </div>
              <div class="col text-grey ellipsis">
                <q-icon name="mdi-store" />
                {{ quotation.customer }}
              </div>
            </div>
          </div>

          <div class="col row q-mt-sm items-center">
            <div class="col q-pr-md ellipsis-2-lines">{{ quotation.sku }}</div>

            <div class="col-auto">
              <div v-if="quotation.price" class="text-bold text-primary text-body1">
                ${{ quotation.price }}
              </div>
              <div v-else-if="quotation.quotation_status == 'requested'" class="row">
                <q-btn
                  outline
                  dense
                  no-caps
                  size="sm"
                  class="q-px-sm q-mr-md"
                  color="red-8"
                  label="Reject"
                  data-cy="btnReject"
                  @click="onRejectQuotation(quotation)"
                />
                <q-btn
                  outline
                  dense
                  no-caps
                  size="sm"
                  class="q-px-sm"
                  color="primary"
                  label="Take Action"
                  data-cy="btnTakeAction"
                  @click="showQuotationDetail(index, quotation)"
                />
              </div>
            </div>
          </div>
        </q-item>

        <q-item v-else class="column" clickable v-ripple>
          <div class="col row items-center">
            <div class="col-auto" style="width: 66px">
              <q-img
                :src="quotation.image && quotation.image.small ? quotation.image.small : ''"
                placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
                ratio="1"
                style="border-radius: 6px"
              />
            </div>
            <div class="col column q-ml-md">
              <div class="col text-weight-medium ellipsis-2-lines">
                {{ quotation.sku }}
              </div>
              <div class="col" style="width: 24px">
                <q-img
                  v-if="quotation.halal == 1"
                  class="q-mr-xs"
                  src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/halal.svg"
                  ratio="1"
                />
              </div>
            </div>
          </div>

          <div class="col row items-center">
            <div class="col column q-mt-sm q-pr-md">
              <div class="col text-grey" style="font-size: 12px">Quotation Price</div>
              <div class="col text-primary text-body1 text-weight-medium">
                {{ quotation.price ? `$${quotation.price}` : '-' }}
              </div>
            </div>

            <div class="col-auto">
              <q-btn
                v-if="quotation.quotation_status == 'pending approval'"
                dense
                no-caps
                rounded
                unelevated
                style="background-color: #dfffd2"
                size="12px"
                class="q-px-sm text-primary"
                label="Pending Approval"
                icon-right="eva-sync-outline"
              />
              <q-btn
                v-else-if="quotation.quotation_status == 'rejected'"
                dense
                no-caps
                rounded
                unelevated
                size="12px"
                style="background-color: rgba(229, 107, 104, 0.1)"
                class="q-px-sm text-red"
                label="Rejected"
                icon-right="eva-close"
              />
              <q-btn
                v-else
                dense
                no-caps
                rounded
                unelevated
                :ripple="false"
                :style="{
                  backgroundColor: quotation.price ? '#dfffd2' : '#efefef'
                }"
                size="12px"
                class="q-px-md"
                :text-color="quotation.price ? 'primary' : 'grey-7'"
                :label="quotation.price ? 'Received' : 'Requested'"
                :icon-right="quotation.price ? 'eva-checkmark-circle-outline' : 'eva-paper-plane-outline'"
              />
            </div>
          </div>
        </q-item>

        <q-separator color="grey-3" />
      </div>
      <template v-slot:loading>
        <div v-if="!fetchingData && quotations.length < totalQuotation" class="row justify-center q-my-md">
          <q-btn v-if="errorLoadMore" flat fab color="primary" icon="mdi-reload" @click="forceLoadMore" />

          <q-spinner-tail v-else color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <!-- Loading indicator -->
    <div class="absolute-center flex flex-center">
      <q-spinner-tail v-if="fetchingData" color="primary" size="40px" />
      <div v-if="!fetchingData && !errorFetchingData && quotations.length == 0" class="text-h6">No Data</div>
      <q-btn
        v-if="!fetchingData && errorFetchingData"
        flat
        rounded
        class="text-bold"
        color="primary"
        label="TRY AGAIN"
        @click="getQuotations"
      />
    </div>

    <!-- Dialog Detail Quotation -->
    <q-dialog v-model="showDetail" position="bottom">
      <div
        v-if="selectedQuotation"
        class="window-height column non-selectable"
        style="-webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none"
      >
        <div class="col-1 bg-transparent">
          <q-btn
            unelevated
            color="transparent"
            :ripple="false"
            class="full-width full-height"
            v-close-popup
          />
        </div>

        <div class="col-11">
          <q-card class="full-height" style="border-radius: 16px 16px 0px 0px">
            <div class="box">
              <div class="row-2 header">
                <div class="row q-mt-sm items-center">
                  <div class="col text-bold text-center q-mb-sm" style="font-size: 16px">
                    Request Quotation Details
                  </div>
                  <q-separator />

                  <div class="absolute-top-right text-subtitle2">
                    <q-btn
                      class="col-auto q-mr-md q-mt-sm"
                      dense
                      unelevated
                      v-close-popup
                      rounded
                      size="sm"
                      text-color="white"
                      icon="eva-close-outline"
                      color="grey-7"
                      data-cy="btnCloseDialogDetail"
                    />
                  </div>
                </div>

                <q-separator />
              </div>

              <div class="row-2 content q-pb-sm q-px-md">
                <div class="col-auto row items-center q-py-md">
                  <q-avatar size="48px">
                    <q-img
                      :src="selectedQuotation.image_requestor ? selectedQuotation.image_requestor.small : ''"
                      placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/user.svg"
                    />
                  </q-avatar>
                  <div class="col column q-pl-md">
                    <div class="col text-weight-medium">
                      {{ selectedQuotation.requestor.upFirstChar() }}
                    </div>
                    <div class="col text-grey">
                      <q-icon name="mdi-store" />
                      {{ selectedQuotation.customer }}
                    </div>
                  </div>
                </div>

                <div class="q-my-xs row justify-between items-center">
                  <div class="column">
                    <div class="text-bold">Request at</div>
                    <div class="text-grey text-caption">
                      {{ $helper.formatDateTime(selectedQuotation.created_at) }}
                    </div>
                  </div>
                  <q-btn
                    v-if="selectedQuotation.quotation_status == 'pending approval'"
                    dense
                    no-caps
                    rounded
                    unelevated
                    style="background-color: #dfffd2"
                    size="12px"
                    class="q-px-sm text-primary"
                    label="Pending Approval"
                    icon-right="eva-sync-outline"
                  />
                </div>

                <div v-if="selectedQuotation.price != null" class="row q-py-sm">
                  <div v-if="selectedQuotation.quoted_by != null" class="col-6 column">
                    <div class="text-bold">Quoted By</div>
                    <div>{{ selectedQuotation.quoted_by.upFirstChar() }}</div>
                  </div>

                  <div v-if="selectedQuotation.approver_id != null" class="col-6 column">
                    <div class="text-bold">Approved By</div>
                    <div>{{ selectedQuotation.approver.upFirstChar() }}</div>
                  </div>
                </div>

                <div class="col-auto text-bold">Product Info</div>

                <div class="col-auto row items-center q-pb-md q-pt-sm">
                  <div class="col-auto" style="width: 66px">
                    <q-img
                      :src="
                        selectedQuotation.image && selectedQuotation.image.small
                          ? selectedQuotation.image.small
                          : ''
                      "
                      placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
                      ratio="1"
                      style="border-radius: 6px"
                    />
                  </div>
                  <div class="col column q-ml-md">
                    <div class="col text-weight-medium ellipsis-2-lines">
                      {{ selectedQuotation.sku }}
                    </div>
                    <div class="col" style="width: 24px">
                      <q-img
                        v-if="selectedQuotation.halal == 1"
                        class="q-mr-xs"
                        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/halal.svg"
                        ratio="1"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="isAdminOrSales" class="col-auto row">
                  <div class="col q-mr-lg">Original Price:</div>
                  <div class="col-auto text-weight-medium text-primary">
                    ${{ selectedQuotation.origin_price }}
                  </div>
                </div>

                <div v-if="isAdminOrSales || this.selectedQuotation.price" class="col-auto row q-mt-sm">
                  <div class="col q-mr-lg">Approved Price:</div>
                  <div class="col-auto text-weight-medium text-primary">${{ price }}</div>
                </div>

                <div
                  v-if="credentials.user_type == 'buyer' && this.selectedQuotation.price"
                  class="row q-mt-sm"
                >
                  <div class="col q-mr-lg">Approved Price / {{ selectedQuotation.uom }}:</div>
                  <div class="col-auto text-weight-medium text-primary">
                    ${{ Number(unitPrice).toFixed(4) }}
                  </div>
                </div>
              </div>

              <div v-if="isAdminOrSales" class="col footer q-pb-sm">
                <q-separator />

                <div class="row items-center q-mt-sm q-px-md items-center">
                  <div class="col text-weight-medium">Price / {{ selectedQuotation.uom }}:</div>
                  <q-input
                    class="col-2 q-mx-md"
                    data-cy="inputPrice"
                    v-model="unitPrice"
                    type="number"
                    inputmode="decimal"
                    pattern="[0-9]*"
                    dense
                    autofocus
                    prefix="$"
                    :decimals="2"
                    :disable="!isAdminOrSales || (selectedQuotation && selectedQuotation.price != null)"
                    input-class="text-primary text-bold"
                    input-style="text-align: center"
                    @keyup.enter="approveQuotation"
                  />
                  <q-btn
                    v-if="selectedQuotation.price == null && isAdminOrSales"
                    outline
                    dense
                    no-caps
                    class="col-4"
                    color="primary"
                    label="Send"
                    data-cy="btnSend"
                    @click="approveQuotation"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script>
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';

export default {
  data() {
    return {
      credentials: this.$store.state,
      quotations: [],
      selectedQuotationIndex: null,
      fetchingData: false,
      errorFetchingData: false,
      totalQuotation: 0,
      errorLoadMore: false,
      showDetail: false,
      unitPrice: null
    };
  },

  computed: {
    isAdminOrSales() {
      /**
       * 1 = super
       * 2 = admin
       * 7 = sales
       */
      return [1, 2, 7].includes(this.credentials.user_type_id);
    },
    selectedQuotation() {
      return this.selectedQuotationIndex != null ? this.quotations[this.selectedQuotationIndex] : null;
    },
    price() {
      if (this.selectedQuotation) {
        if (this.selectedQuotation.price) return this.selectedQuotation.price;
        else if (this.unitPrice)
          return (Number(this.unitPrice) * Number(this.selectedQuotation.unit_per_oom)).toFixed(4);
      }

      return '-';
    }
  },

  mounted() {
    this.$refs.infiniteScroll.stop();

    this.getQuotations();
  },

  methods: {
    showDialog(title, message, onDismiss) {
      this.$q
        .dialog({
          parent: this,
          component: AlertMessage,
          title: title,
          message: message
        })
        .onDismiss(() => {
          if (onDismiss) onDismiss();
        });
    },

    getQuotationCondition() {
      return this.credentials.tenant_id
        ? `tenant_id = ${this.credentials.tenant_id} AND id NOT IN (SELECT id from v_quotations where price is not null and approver_id is null)`
        : null;
    },

    async getQuotations() {
      if (this.fetchingData) return;

      this.errorFetchingData = false;
      this.quotations = [];
      this.totalQuotation = 0;

      this.fetchingData = true;

      const condition = this.getQuotationCondition();

      try {
        if (!condition) throw 'Your request cannot be processed.';

        // 1. Check total customer (count)
        const response = await this.$api.get('v_quotations', condition, 'COUNT(id) as total');

        if (!response.status) throw response.message;
        this.totalQuotation = response.data[0].total;

        const { status, message, data } = await this.$api.get(
          'v_quotations',
          condition,
          null,
          'approver_id IS NULL DESC, id DESC', // Sort requested first, then id desc
          '0,25'
        );

        if (status) this.quotations = data;
        else this.showDialog('Failed', message);

        this.errorFetchingData = false;

        if (this.$refs.infiniteScroll) this.$refs.infiniteScroll.resume();
      } catch (err) {
        this.showDialog('Failed', err);

        this.errorFetchingData = true;
      } finally {
        this.fetchingData = false;
      }
    },

    async onLoadMore(index, done) {
      if (this.quotations.length >= this.totalQuotation) {
        this.$refs.infiniteScroll.stop();
        return;
      }

      this.errorLoadMore = false;

      const condition = this.getQuotationCondition();

      const { status, message, data } = await this.$api.get(
        'v_quotations',
        condition,
        null,
        'approver_id IS NULL DESC, id DESC', // Sort requested first, then id desc
        `${this.quotations.length},25` // Offet,Limit
      );

      if (status) {
        this.quotations = this.quotations.concat(data);
        done();

        if (this.quotations.length >= this.totalQuotation) this.$refs.infiniteScroll.stop();
      } else {
        this.showDialog('Failed', message);
      }

      this.errorLoadMore = !status;
    },

    forceLoadMore() {
      this.$refs.infiniteScroll.stop();
      this.$refs.infiniteScroll.resume();
    },

    showQuotationDetail(index, quotation) {
      this.selectedQuotationIndex = index;
      this.unitPrice = quotation.price ? Number(quotation.unit_price) : null;
      this.showDetail = true;
    },

    onRejectQuotation(quotation) {
      this.$q
        .dialog({
          title: 'Reject Quotation',
          message: 'Are you sure want to reject this quotation request?',
          component: ConfirmMessage
        })
        .onOk(() => this.rejectQuotation(quotation));
    },

    async rejectQuotation(quotation) {
      try {
        this.$q.loading.show({
          message: 'Please wait..'
        });

        const payload = {
          action_type: 1,
          quotation_id: quotation.id,
          user_id: this.credentials.id,
          approve: 0
        };

        const { status, message, data } = await this.$api.exec('p_approve_quotation', [
          JSON.stringify(payload)
        ]);

        if (status) this.notifyBuyer('reject_quotation', quotation);

        this.$q.loading.hide();

        if (!status) throw message;

        this.showDialog('Success', 'Quotation has been Rejected!');

        this.getQuotations();
      } catch (err) {
        this.showDialog('Failed', err);
      }
    },

    async approveQuotation() {
      try {
        if (!this.unitPrice) throw 'Unit price cannot be empty';
        if (this.unitPrice < 0) throw 'Unit price cannot be minus';

        this.$q.loading.show({
          message: 'Please wait..'
        });

        const payload = {
          action_type: 0,
          quotation_id: this.selectedQuotation.id,
          unit_price: Number(this.unitPrice),
          price: Number(this.unitPrice) * Number(this.selectedQuotation.unit_per_oom),
          user_id: this.credentials.id,
          approve: 1
        };

        const { status, message, data } = await this.$api.exec('p_approve_quotation', [
          JSON.stringify(payload)
        ]);

        if (status) this.notifyBuyer('approve_quotation', this.selectedQuotation);

        this.$q.loading.hide();

        if (!status) throw message;

        if (data && data.length > 0) this.quotations[this.selectedQuotationIndex] = data[0];
        else this.getQuotations();

        this.showDialog('Success', 'Quotation has been approved!', () => {
          this.showDetail = false;
          this.unitPrice = null;

          /* Check if next quotation is need for approval */
          const nextQuotation = this.quotations[this.selectedQuotationIndex + 1];
          if (nextQuotation && !nextQuotation.price && nextQuotation.status == null)
            this.showQuotationDetail(this.selectedQuotationIndex + 1, nextQuotation);
          else this.selectedQuotationIndex = null;
        });
      } catch (err) {
        this.showDialog('Failed', err);
      }
    },

    async notifyBuyer(type, quotation) {
      /* Send push notification to buyer */
      const response = await this.$api.add('app_notification', {
        target_only: true,
        user_id: this.credentials.id,
        app_mode: this.$firebase.appMode(),
        notification_type: type,
        customer: quotation.customer,
        quotation_id: quotation.id,
        requestor_user_id: quotation.requestor_id
      });
    }
  }
};
</script>

<style>
.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.box .row {
  border: 0px dotted grey;
}

.box .row-2.header {
  flex: 0 1 auto;
  /* The above is shorthand for:
      flex-grow: 0,
      flex-shrink: 1,
      flex-basis: auto
      */
}

.box .row-2.content {
  flex: 1 1 auto;
  overflow: auto;
}

.box .col.footer {
  flex: 0 1 auto;
}
</style>
