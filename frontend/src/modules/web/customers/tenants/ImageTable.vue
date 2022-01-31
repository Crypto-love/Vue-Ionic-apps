<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      row-key="imageLocation"
      :hide-bottom="true"
      grid
      dense
    >
      <template v-slot:top-right>
        <div class="q-pa-xs col-xs-6 col-sm-4 col-md-3 col-lg-2 grid-style-transition">
          <q-img :src="logo" native-context-menu contain></q-img>

          <q-btn
            no-caps
            class="q-ml-md"
            size="11px"
            color="primary"
            @click="
              selectedItem = null;
              showForm = true;
            "
            :disable="disabled"
            >{{ logoAddress ? 'Update Logo' : 'Add Logo' }}</q-btn
          >
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <image-upload
        title="Select Files"
        allowed-file-types=".jpg, .png, .jpeg"
        @on-add="onAddFile"
        :maxFileSize="2097152"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import ImageUpload from 'web/share/partial/newImageUpload.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { aws_s3_bucket_public } from 'src/config';
import axios, { AxiosResponse } from 'axios';
import { updateNewSupplierDashboardAdmin } from 'treeGQL';

export default {
  components: {
    ImageUpload
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
      default: null
    },
    custName: {
      type: String,
      default: ''
    },
    logoAddress: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      data: [],
      columns: [
        {
          name: 'logo',
          label: 'Logo',
          align: 'left',
          field: 'logo',
          sortable: true
        }
      ]
    };
  },
  computed: {
    logo() {
      if (this.custName) {
        if (this.logoAddress) {
          return typeof this.logoAddress === 'string' && this.logoAddress.startsWith('http')
            ? this.logoAddress
            : `${aws_s3_bucket_public}/supplier-logos/${this.logoAddress}`;
        }
        return `${aws_s3_bucket_public}/supplier-logos/no_image.png`;
      }
    }
  },
  methods: {
    async onAddFile(val) {
      this.$q.loading.show({
        message: 'Uploading...'
      });
      try {
        const payload = {
          logo: this.logoAddress,
          base64: val.base64Encoded,
          imageType: val.type
        };
        this.$emit('add-file', payload);
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async updateSupplier(data) {
      try {
        return await this.$apollo
          .mutate({
            mutation: updateNewSupplierDashboardAdmin,
            variables: {
              data: data
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>
<style scoped>
.uploader {
  min-width: 700px;
}
</style>
