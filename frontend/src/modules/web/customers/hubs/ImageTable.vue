<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="image"
      grid
      dense
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Images</div>
      </template>

      <template v-slot:top-right>
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
          >Add Images</q-btn
        >
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-6 col-sm-4 col-md-3 col-lg-2 grid-style-transition">
          <q-img :src="props.row.image.large" native-context-menu contain>
            <q-icon
              class="absolute all-pointer-events"
              size="24px"
              name="eva-trash"
              color="red"
              style="top: 8px; right: 8px"
              @click="showDeleteConfirm(props.row.id)"
            >
              <q-tooltip>Delete Image</q-tooltip>
            </q-icon>
          </q-img>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <image-multi-upload title="Select Files" allowed-file-types=".jpg, .png, .jpeg" @on-add="onAddFile" />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import ImageMultiUpload from 'web/share/partial/ImageMultiUpload.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
export default {
  components: {
    ImageMultiUpload
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
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
          name: 'image',
          label: 'Image',
          align: 'left',
          field: 'image',
          sortable: true
        }
      ]
    };
  },
  watch: {
    custId(v) {
      if (v) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      const res = await Api.get(
        'customer_images',
        `customer_id = ${this.custId} AND active = 1`,
        null,
        'id DESC'
      );
      this.data = [...res.data];
    },
    async onAddFile(payload) {
      this.$q.loading.show({
        message: 'Uploading...'
      });
      try {
        payload = payload.map((v) => ({
          customer_id: this.custId,
          image: v
        }));

        /** Insert to table `customer_images` */
        for (let v of payload) {
          const res = await Api.add('customer_images', v);
          if (!res.status) {
            throw new Error(res.message);
          }
        }
        this.showForm = false;
        this.getData();
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    showDeleteConfirm(id) {
      this.selectedItem = id;
      this.$q
        .dialog({
          title: 'Delete Confirmation',
          message: 'Are you sure want to delete this image ?',
          component: ConfirmMessage
        })
        .onOk(this.delete)
        .onCancel(() => {});
    },
    async delete() {
      this.$q.loading.show({
        message: 'Deleting...'
      });
      try {
        const res = await Api.update('customer_images', { active: 0 }, this.selectedItem);
        if (!res.status) {
          throw new Error(res.message);
        }
        this.getData();
        this.selectedItem = null;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
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
