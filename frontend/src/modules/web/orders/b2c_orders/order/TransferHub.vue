<template>
  <form-dialog title="Transfer Hub" class="modal-sm">
    <q-card-section>
      <div class="q-gutter-md row">
        <div class="col">
          <div class="label" style="font-weight: 600">From</div>
          <q-select filled v-model="hubFrom" :options="hubOptions" label="Select Hub" />
        </div>
        <div class="col">
          <div class="label" style="font-weight: 600">To</div>
          <q-select filled v-model="hubTo" :options="hubOptions" label="Select Hub" />
        </div>
      </div>
    </q-card-section>
    <template v-slot:actions>
      <template>
        <q-btn flat label="Close" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn flat label="Process" class="btn-save q-mr-sm" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormDialog from 'web/share/partial/FormDialog.vue';
import { Api, Notice } from 'services';
export default {
  components: {
    FormDialog
  },
  data() {
    return {
      hubFrom: null,
      hubTo: null,
      hubOptions: ['Hub A', 'Hub B', 'Hub C', 'Hub D', 'Hub E']
    };
  }
};
</script>
