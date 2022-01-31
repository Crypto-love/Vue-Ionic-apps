<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Tookan Settings</div>
        </div>
      </div>
      <div class="header-right">&nbsp;</div>
    </div>
    <div class="content">
      <div class="form-group row q-mb-md">
        <div class="form-label col-sm-3 col-md-2 col-xs-12">API KEY</div>
        <div class="col-sm-9 col-md-10 col-xs-12">
          <q-input outlined dense v-model="api_key"></q-input>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-sm-9 col-md-10 offset-sm-3 offset-md-2">
          <q-btn color="primary" label="Save" icon="eva-save" />
        </div>
      </div>
    </div>
  </q-page>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      api_key: null
    };
  }
};
</script>
<style scoped>
.form-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
</style>
