<template>
  <form-card
    :title="isEditMode ? `Edit Delivery Days` : `Add Delivery Days`"
    scroll-area-height="380"
    class="address-form"
    :style="`height: ${height}px;width:480px;min-width:unset;overflow:hidden;`"
  >
    <q-form @submit.prevent="onSubmit" id="DayForm">
      <q-field
        v-model="selectedDays"
        borderless
        label="Select days"
        stack-label
        :rules="[(v) => (v && v.length > 0) || 'Please pick at least 1 day']"
      >
        <template v-slot:control>
          <q-option-group v-model="selectedDays" :options="days" color="primary" type="checkbox" inline />
        </template>
      </q-field>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
      <q-btn flat label="Save" type="submit" form="DayForm" class="btn-save" />
    </template>
  </form-card>
</template>

<script>
import { Notice } from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import { isNumeric } from 'services';
import { getDays } from 'treeGQL';

export default {
  components: {
    FormCard
  },
  props: {
    custId: {
      type: Number,
      required: true
    },
    item: {
      type: Object,
      default: null
    },
    assignedDay: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      submitLoading: false,
      opening: null,
      closing: null,
      selectedDays: [],
      days: [],
      numericRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ]
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    },
    height() {
      if (this.isEditMode) {
        return 300;
      }
      return 400;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        const res = await this.getDays();
        this.selectedDays = res.filter((x) => this.assignedDay.includes(x.id)).map((v) => v.id);
        this.days = res.map((v) => ({
          label: v.description,
          value: v.id,
          disable: this.assignedDay.includes(v.id)
        }));
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getDays() {
      return new Promise((resolve, reject) => {
        return this.$apollo
          .query({
            query: getDays
          })
          .then((res) => {
            resolve(res.data.getDays);
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
    onSubmit() {
      const payload = this.selectedDays
        .sort((a, b) => a - b)
        .map((v) => ({
          customer_id: this.custId,
          day_id: v
        }));
      this.$emit('add-complete', payload);
    }
  }
};
</script>
<style scoped>
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
