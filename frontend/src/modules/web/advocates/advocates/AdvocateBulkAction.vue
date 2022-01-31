<template>
  <q-card padding style="width: 400px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6">{{ actionType ? 'Approve' : 'Reject' }} Host</span>
    </q-card-section>
    <q-card-section class="q-py-sm">
      <p class="text-h7 text-grey-8">
        Would you like to {{ actionType ? 'Approve' : 'Reject' }}
        <span class="text-weight-bold">{{ getUserName }}</span
        >?
      </p>
    </q-card-section>
    <q-card-section class="row">
      <div class="col-6 q-pr-md" v-close-popup>
        <q-btn
          label="Cancel"
          text-color="grey-8"
          outline
          rounded
          class="full-width text-capitalize"
          @click="$emit('close')"
        />
      </div>
      <div class="col-6 q-pl-md">
        <q-btn
          :label="actionType ? 'Approve' : 'Reject'"
          :color="actionType ? 'primary' : 'red'"
          rounded
          class="full-width text-capitalize"
          @click="$emit('bulkUpdate')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  components: {},
  props: {
    userList: {
      type: [Array],
      default: null
    },
    actionType: {
      type: [Boolean],
      default: true
    }
  },
  computed: {
    getUserName() {
      if (this.userList.length == 1) return this.userList[0].full_name;
      else
        return this.userList.reduce((pre, cur) => {
          console.log(pre + ' ::: ' + cur);
          if (pre.full_name) return pre.full_name + ', ' + cur.full_name;
          else return pre + ', ' + cur.full_name;
        });
    }
  },
  methods: {}
};
</script>
<style scoped></style>
