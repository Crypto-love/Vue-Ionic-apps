<template>
  <q-dialog persistent ref="dialog" @hide="onDialogHide">
    <div class="column q-pa-lg text-center bg-white" style="width: 500px; max-width: 40vw">
      <div class="col text-h6">{{ title }}</div>

      <div v-html="message" class="col q-my-md" />

      <q-btn
        v-for="(server, index) in servers"
        :key="index"
        push
        color="primary"
        :label="server.label"
        @click="prompt(server.url)"
      />

      <div class="col row q-mt-sm justify-center">
        <q-btn push v-close-popup class="col-5" size="14px" color="grey" label="Cancel" />
      </div>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="q-pt-none">
          <q-input type="password" dense autofocus @input="onInput" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    },
    message: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      servers: [
        {
          label: 'TEST',
          url: 'https://test.thetreedots.com'
        },
        {
          label: 'STAGE',
          url: 'https://stage.thetreedots.com'
        },
        {
          label: 'PRODUCTION',
          url: 'https://dashboard.thetreedots.com'
        },
        {
          label: 'BACKUP',
          url: 'https://app.thetreedots.com'
        },
        {
          label: 'FOODBANK',
          url: 'https://foodbank.thetreedots.com/login'
        }
      ],
      dialog: false,
      selectedUrl: ''
    };
  },

  methods: {
    prompt(url) {
      this.selectedUrl = url;
      this.dialog = true;
    },

    onInput(text) {
      if (text && text === 'D3vs0nly') {
        this.dialog = false;

        this.$q.loading.show({
          message: 'Switching server..'
        });

        window.location.replace(this.selectedUrl);
      }
    },

    show() {
      this.$refs.dialog.show();
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      this.$emit('hide');
    },

    onCancelClick() {
      this.hide();
    }
  }
};
</script>
