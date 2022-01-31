<template>
  <q-card padding style="width: 400px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6"> Update Location on Map </span>
    </q-card-section>
    <q-card-section class="q-py-sm">
      <span class="text-h7 text-grey-8">Would you like to confirm this location?</span>
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
          label="Update"
          color="primary"
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
  props: {
    userInfo: {
      type: Object,
      default: () => {}
    }
  }
};
</script>
<style scoped></style>
