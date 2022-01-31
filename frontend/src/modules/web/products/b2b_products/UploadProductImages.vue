<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Upload Product Images</div>
          <div class="text-caption d-none">You can upload data by clicking on corresponding buttons</div>
        </div>
      </div>
    </div>
    <q-file color="purple-12" v-model="files" multiple accept=".zip,.csv" label="Select Files">
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
      <template v-slot:after>
        <q-btn round dense flat class="btn-add q-mr-xs" @click="readFiles()">Upload</q-btn>
      </template>
    </q-file>
  </q-page>
</template>

<script>
import { updateProductImages, fileToBase64 } from 'services';
import XLSX from 'xlsx';

export default {
  components: {},
  data() {
    return {
      files: null,
      csvFile: null,
      zipFile: null,
      csvData: null,
      data: []
    };
  },
  mounted() {},
  methods: {
    async readFiles() {
      for (let i = 0; i < this.files.length; i++) {
        let fileName = this.files[i].name;
        if (fileName.substr(fileName.indexOf('.')) === '.zip') {
          this.zipFile = this.files[i];
        } else if (fileName.substr(fileName.indexOf('.')) === '.csv') {
          this.csvFile = this.files[i];
        }
      }
      const reader = new FileReader();

      reader.onerror = (event) => {
        console.error('File could not be read! Code ' + event.target.error.code);
      };

      reader.onload = async (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, {
          type: 'binary'
        });
        const sheet_name = 'Sheet1';
        const dataInCSV = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name]);
        this.csvData = dataInCSV;
        this.sendData();
      };
      reader.readAsBinaryString(this.csvFile);
    },
    async sendData() {
      const zip = this.zipFile;
      if (zip) {
        const encoded = await fileToBase64(zip);
        await this.$apollo
          .mutate({
            mutation: updateProductImages,
            variables: {
              data: encoded,
              csvData: JSON.stringify(this.csvData)
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
};
</script>
<style scoped>
.top-right-inline {
  display: flex;
}
.top-right-inline .act-btn {
  margin-left: 0.5rem;
  border-radius: 0.35rem;
  margin-bottom: 0.5rem;
}
.td-table thead th {
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #dedede !important;
}
.td-table tbody td {
  position: relative;
  height: auto;
  padding: 0.15rem 1rem;
}
@media (max-width: 480px) {
  .top-right-inline {
    display: block;
  }
  .top-right-inline .top-actions {
    display: block;
    width: 100%;
    text-align: center;
  }
  .top-right-inline .act-search {
    display: block;
    width: 100%;
    margin-left: 0;
  }
  .q-table__control {
    display: block !important;
    width: 100%;
  }
}
</style>
