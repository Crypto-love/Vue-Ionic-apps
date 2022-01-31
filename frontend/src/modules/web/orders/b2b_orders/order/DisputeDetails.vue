<template>
  <q-card class="product-form main-card" style="overflow: hidden; height: 450px; max-height: 100%">
    <q-card-section>
      <div class="text-h6">Dispute Confirmation</div>
    </q-card-section>
    <q-card-section>
      <q-form class="q-gutter-md" v-if="data">
        <q-input readonly :value="productName" label="Product" />
        <q-input readonly :value="reasonName" label="Reason" />
        <q-input readonly :value="remedyName" label="Remedy" />
        <q-select
          filled
          v-model="data.status"
          :options="statusOptions"
          label="Dispute Status"
          emit-value
          map-options
          @input="onChange"
        />
      </q-form>
    </q-card-section>
    <q-card-actions class="absolute-bottom card-footer" align="right">
      <q-btn flat no-caps label="Close" class="btn-cancel" v-close-popup />
      <q-btn
        flat
        label="Save"
        class="btn-save"
        @click="save"
        data-cy="product-save-btn"
        :disable="!changed"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { Api, Notice } from 'services';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  props: {
    disputeId: {
      required: true
    },
    productName: String
  },
  data() {
    return {
      data: null,
      isLoading: false,
      changed: false,
      statusOptions: [
        {
          label: this.$t('dispute_status_processing'),
          value: 0
        },
        {
          label: this.$t('dispute_status_resolved'),
          value: 1
        },
        {
          label: this.$t('dispute_status_declined'),
          value: 2
        }
      ]
    };
  },
  computed: {
    statusColor() {
      const map = ['yellow', 'green', 'red'];
      return this.data && map[this.data.status];
    },
    reasonName() {
      const reasonNames = [
        this.$t('drn_goods_spoild'),
        this.$t('drn_missing_item'),
        this.$t('drn_delayed_delivery')
      ];
      return reasonNames[this.data.reason];
    },
    remedyName() {
      const remedyNames = [
        this.$t('dry_request_exchange'),
        this.$t('dry_request_credit'),
        this.$t('dry_request_pick_item'),
        this.$t('dry_no_remedy')
      ];
      return remedyNames[this.data.remedy];
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.$q.loading.show();
        const { data, status, message } = await Api.get('order_item_disputes', `id = ${this.disputeId}`);
        this.data = data[0];
      } catch (error) {
      } finally {
        this.$q.loading.hide();
      }
    },
    async save() {
      this.$q.loading.show({
        message: 'Updating dispute status...'
      });
      this.$emit('save');
      try {
        await Api.update('order_item_disputes', { status: this.data.status }, this.data.id);
        Notice.ok('Dispute updated');
        let notificationType;
        if (this.data.status == 1) {
          notificationType = 'resolved_disputes';
        } else if (this.data.status == 2) {
          notificationType = 'declined_disputes';
        }
        if (notificationType) {
          this.$api.add('app_notification', {
            table_id: this.data.order_item_id,
            user_id: this.$store.state.id,
            app_mode: this.$firebase.appMode(),
            notification_type: notificationType
          });
        }
      } catch (error) {
      } finally {
      }
      this.$q.loading.hide();
    },
    onChange() {
      this.changed = true;
    }
  }
};
</script>
<style scoped>
/* Card ------------- */
.main-card {
  position: relative;
}
.main-card .card-top-header {
  position: sticky;
  display: flex;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 15px;
}
.main-card .card-top-header .btn {
  width: 30%;
}
.main-card .card-top-header .search {
  width: 65%;
  border: 1px transparent;
  margin-right: 10px;
}
.card-body {
  height: calc(100% - 90px);
}
.card-footer {
  border-top: 1px solid #fefefe;
  background: #ffffff;
  padding: 0.5rem 1rem 0.8rem 1rem;
}

/* ./Card ------------- */
.product-form {
  width: 720px;
  border-radius: 20px;
}
.form-group {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.card-action {
  display: block;
  width: 100%;
  position: relative;
  text-align: right;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
}
.btn-save {
  color: #ffffff;
  background: #04565a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-cancel {
  color: #666666;
  background: #e4e4e4;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.q-field--with-bottom {
  padding-bottom: 15px;
}
</style>
