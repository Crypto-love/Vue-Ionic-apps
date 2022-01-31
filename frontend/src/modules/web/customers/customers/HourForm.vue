<template>
  <form-card
    :title="isEditMode ? `Edit Working Hour` : `Add Working Hours`"
    scroll-area-height="380"
    class="address-form"
    :style="`height: ${height}px;width:480px;min-width:unset;overflow:hidden;`"
  >
    <q-form @submit.prevent="onSubmit" id="hourForm">
      <q-input filled v-model="opening" mask="time" :rules="['time']" label="Opening Hour">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="opening" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input filled v-model="closing" mask="time" :rules="['time']" label="Closing Hour">
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="closing" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-field
        v-if="!isEditMode"
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
      <q-btn flat label="Save" type="submit" form="hourForm" class="btn-save" />
    </template>
  </form-card>
</template>

<script>
import { Api, Notice } from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import { isEmailValid, isNumeric } from 'services';
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
    this.getData().then(() => {
      if (this.isEditMode) {
        /** Separate unnecessary keys to prevent submit error */
        this.opening = `${this.item.open_hour
          .toString()
          .padStart(2, '0')}:${this.item.open_minute.toString().padStart(2, '0')}`;
        this.closing = `${this.item.close_hour
          .toString()
          .padStart(2, '0')}:${this.item.close_minute.toString().padStart(2, '0')}`;
      }
    });
  },
  methods: {
    async getData() {
      try {
        const res = await this.getDays();
        if (!res.status) throw new Error(res.message);
        this.days = res.data.map((v) => ({
          label: v.description,
          value: v.id,
          disable: this.assignedDay.includes(v.id)
        }));
        this.selectedDays = [...this.assignedDay];
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getDays() {
      return Api.get('days');
    },
    extractTime(t) {
      const splitted = t.split(':');
      return {
        hour: parseInt(splitted[0]),
        minute: parseInt(splitted[1])
      };
    },
    onSubmit() {
      const open = this.extractTime(this.opening);
      const close = this.extractTime(this.closing);
      if (this.isEditMode) {
        const payload = {
          open_hour: open.hour,
          open_minute: open.minute,
          close_hour: close.hour,
          close_minute: close.minute
        };
        this.$emit('edit-complete', payload, this.item.id);
      } else {
        const payload = this.selectedDays
          .sort((a, b) => a - b)
          .map((v) => ({
            customer_id: this.custId,
            day_id: v,
            open_hour: open.hour,
            open_minute: open.minute,
            close_hour: close.hour,
            close_minute: close.minute
          }));
        this.$emit('add-complete', payload);
      }
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
