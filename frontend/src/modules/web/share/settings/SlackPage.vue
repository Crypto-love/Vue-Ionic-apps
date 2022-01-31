<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Slack Settings</div>
        </div>
      </div>
      <div class="header-right">&nbsp;</div>
    </div>
    <div class="content">
      <div class="form-group row q-mb-md">
        <div class="form-label col-sm-3 col-md-2 col-xs-12">To receive orders</div>
        <div class="col-sm-9 col-md-10 col-xs-12">
          <q-btn color="blue" label="Click to Connect" />
        </div>
      </div>
      <div class="form-group row q-mb-md">
        <div class="form-label col-sm-3 col-md-2 col-xs-12">Item watchlist</div>
        <div class="col-sm-9 col-md-10 col-xs-12">
          <q-btn color="blue" label="Click to Connect" />
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
