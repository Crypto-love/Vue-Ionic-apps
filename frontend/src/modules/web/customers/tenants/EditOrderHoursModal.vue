<template>
  <q-card padding style="width: 450px; max-width: 450px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6">
        {{ mode ? 'Edit Order Hours' : 'Edit Delivery Hours' }}({{ item.day }})
      </span>
    </q-card-section>
    <q-card-section class="row q-py-sm">
      <div class="col-12 q-mb-xs">Start Time</div>
      <q-input
        style="width: 80%"
        placeholder="--:--"
        outlined
        dense
        v-model="startTime"
        mask="time"
        :rules="['time']"
      >
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="startTime" mask="HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="row q-py-sm q-mb-md">
      <div class="col-12 q-mb-xs">End Time</div>
      <q-input
        style="width: 80%"
        placeholder="--:--"
        outlined
        dense
        v-model="endTime"
        mask="time"
        :rules="['time']"
      >
        <template v-slot:append>
          <q-icon name="access_time" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-time v-model="endTime" mask="HH:mm">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="row col-12">
      <span class="text-grey-6">{{ mode ? 'Order Hours:' : 'Delivery Hours' }}</span>
      <q-space></q-space>
      <span class="text-primary text-weight-bold"
        >{{ startTime || '--:--' }} to {{ endTime || '--:--' }}</span
      >
    </q-card-section>
    <q-card-section class="row col-12">
      <div class="q-pr-md col-6" v-close-popup>
        <q-btn
          label="Cancel"
          text-color="grey-8"
          outline
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="$emit('close')"
        />
      </div>
      <div class="q-pl-md col-6">
        <q-btn
          label="Save"
          color="primary"
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="updateItem()"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { Notice } from 'services';
// import moment from 'moment';
export default {
  components: {},
  props: {
    item: {
      type: Object,
      required: true
    },
    mode: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      startTime: this.processTime(this.item.open_hour, this.item.open_minute),
      endTime: this.processTime(this.item.close_hour, this.item.close_minute)
    };
  },
  methods: {
    processTime(hour, minute) {
      let now = new Date();
      now.setHours(hour);
      now.setMinutes(minute);
      return now.toLocaleString('en-GB', {
        hour: '2-digit', // numeric, 2-digit
        minute: '2-digit' // numeric, 2-digit
      });
    },
    updateItem() {
      if (!this.startTime) {
        Notice.fail('Please select start time!');
        return;
      }
      if (!this.endTime) {
        Notice.fail('Please select end time!');
        return;
      }
      let open = this.startTime.split(':');
      let close = this.endTime.split(':');

      if (open[0] > 24 || close[0] > 24 || open[1] > 59 || close[1] > 59) {
        Notice.fail('Please input time correctly!');
        return;
      }
      this.$emit('update', {
        day_id: this.item.day_id,
        open_hour: open[0],
        open_minute: open[1],
        close_hour: close[0],
        close_minute: close[1],
        active: this.item.active
      });
    }
  }
};
</script>
<style scoped></style>
