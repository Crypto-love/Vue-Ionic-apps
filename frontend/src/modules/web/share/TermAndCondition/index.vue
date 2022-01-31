<template>
  <q-page padding>
    <div class="data-header">
      <div class="header">
        <div class="text-title text-h6 float-right">
          <q-btn
            v-if="isPublishEnabled"
            flat
            :label="publish_btn_text"
            class="btn-save"
            @click="publish()"
            :disable="!isPublishEnabled"
          />
        </div>
        <div class="top-header">
          <div class="text-title text-h6">Terms and Conditions | Version : {{ version }}</div>

          <div class="text-caption">
            You can edit the Term and Conditions and save the changes here. Last saved : {{ lastCreated }}
          </div>
          <div class="text-caption">
            Last Published version : {{ lastPublishedversion }} | Published at {{ lastPublishedAt }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="lastCreated != ''">
      <div class="q-pa-md q-gutter-md">
        <q-editor
          v-model="qeditor_term_conditions"
          height="600px"
          :dense="$q.screen.lt.md"
          :toolbar="[
            [
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify']
              }
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
              }
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent']
          ]"
        />
      </div>
      <div class="t-c-bottom-buttons">
        <q-btn flat label="Save Changes" class="btn-save" @click="saveChanges()" :disable="!isSaveEnabled" />
      </div>
    </div>
    <div v-else class="text-title text-h7">Loading content...</div>
  </q-page>
</template>

<script>
import AlertMessage from '../partial/AlertMessage';
import { Quasar, QEditor } from 'quasar';

import { Api } from 'services';

export default {
  data() {
    return {
      qeditor_term_conditions: '',
      initialBase64: '',
      lastCreated: '',
      version: '',
      publish_btn_text: 'Publish',
      isSaveEnabled: false,
      isPublishEnabled: false,
      lastPublishedversion: '',
      lastPublishedAt: '',
      editorOptions: {
        hideModeSwitch: true
      }
    };
  },
  watch: {
    qeditor_term_conditions: function (val) {
      if (this.base64Encode(val) == this.initialBase64) {
        this.isSaveEnabled = false;
      } else {
        this.isSaveEnabled = true;
      }
    },
    version: function (val) {
      this.publish_btn_text = `Publish v${this.version}`;
    }
  },
  async mounted() {
    let res = await Api.get('app_term_conditions', null, null, 'id desc', '1');
    if (res.status) {
      if (res.data.length > 0) {
        this.initialBase64 = res.data[0].term_condition;
        this.qeditor_term_conditions = this.base64Decode(res.data[0].term_condition);
        this.lastCreated = res.data[0].created_at;
        this.version = res.data[0].id;
        this.isPublishEnabled = !res.data[0].active;
      }
    }

    res = await Api.get('app_term_conditions', 'active = 1', null, 'id desc', '1');
    if (res.status) {
      if (res.data.length > 0) {
        this.lastPublishedAt = res.data[0].updated_at;
        this.lastPublishedversion = res.data[0].id;
      }
    }
  },

  methods: {
    base64Encode(data) {
      return btoa(unescape(encodeURIComponent(data)));
    },
    base64Decode(data) {
      return decodeURIComponent(escape(atob(data)));
    },
    async saveChanges() {
      const newContent = this.base64Encode(this.qeditor_term_conditions);
      if (this.initialBase64 == newContent) {
        this.showDialog('No Changes', 'No changes found in the term and conditions to be saved!');
        return;
      }

      const payload = {
        content: `${newContent}`,
        active: 0,
        token_key: `` // TODO: Needs to be verified
      };
      const res = await Api.exec('p_update_term_conditions', [JSON.stringify(payload)]);

      if (!res.status || res.data.length == 0) {
        this.showDialog('Failed', 'Can not save the term and conditions updates, Please try again.');
      }
      if (res.data.length > 0) {
        this.initialBase64 = res.data[0].term_condition;
        this.qeditor_term_conditions = this.base64Decode(res.data[0].term_condition);
        this.lastCreated = res.data[0].created_at;
        this.version = res.data[0].id;
        this.isSaveEnabled = false;
        this.isPublishEnabled = !res.data[0].active;
        this.showDialog('Saved', 'Terms and conditions changes are updated.');
      }
    },
    async publish() {
      const payload = {
        id: this.version,
        active: 1,
        token_key: `` // TODO: Needs to be verified
      };
      const res = await Api.exec('p_update_term_conditions', [JSON.stringify(payload)]);

      if (!res.status || res.data.length == 0) {
        this.showDialog(
          'Publish Failed',
          'Can not publish the term and conditions updates, Please try again.'
        );
      }
      if (res.data.length > 0) {
        this.initialBase64 = res.data[0].term_condition;
        this.qeditor_term_conditions = this.base64Decode(res.data[0].term_condition);
        this.lastCreated = res.data[0].created_at;
        this.version = res.data[0].id;
        this.isSaveEnabled = false;
        this.isPublishEnabled = !res.data[0].active;
        this.lastPublishedAt = res.data[0].updated_at;
        this.lastPublishedversion = res.data[0].id;
        this.showDialog('Published', 'Terms and conditions changes are published successfully.');
      }
    },
    showDialog(title, message, callback) {
      this.$q
        .dialog({
          parent: this,
          component: AlertMessage,
          title: title,
          message: message
        })
        .onDismiss(() => {
          if (callback) callback();
        });
    }
  }
};
</script>
<style scoped>
.t-c-bottom-buttons {
  margin-top: 20px;
  float: right;
}

.t-c-bottom-buttons .q-btn {
  margin-left: 10px;
}

.header {
  width: 100%;
}
</style>
