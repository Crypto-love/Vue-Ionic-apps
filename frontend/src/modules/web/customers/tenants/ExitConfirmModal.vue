<template>
  <q-card padding style="width: 400px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6">Exit Page</span>
    </q-card-section>
    <q-card-section class="q-py-sm">
      <span class="text-h7 text-grey-8"
        >Your information will not be saved. Are you sure you would like to exit this page?</span
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
        <q-btn label="Exit" color="red" rounded class="full-width text-capitalize" @click="$emit('goback')" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {};
</script>
<style scoped></style>
