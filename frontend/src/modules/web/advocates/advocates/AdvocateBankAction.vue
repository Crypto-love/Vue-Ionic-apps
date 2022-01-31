<template>
  <q-card padding style="width: 400px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6"
        >{{ actionType ? 'Verify' : 'Delete' }} Bank Detail</span
      >
    </q-card-section>
    <q-card-section class="q-py-sm">
      <span class="text-h7 text-grey-8"
        >Would you like to {{ actionType ? 'verify' : 'delete' }} this Bank Detail?</span
      >
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
          :label="actionType ? 'Verify' : 'Delete'"
          :color="actionType ? 'primary' : 'red'"
          rounded
          class="full-width text-capitalize"
          @click="$emit('update')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  components: {},
  props: {
    actionType: {
      type: [Boolean],
      default: true
    }
  }
};
</script>
<style scoped></style>
