<template>
  <div class="data1 column justify-between">
    <div class="dialogData1 column justify-center items-center" :style="`background-color: ${color};`">
      <q-icon :name="icon" color="white" size="xl" />
    </div>
    <div class="dataInfo1">{{ val }}</div>
    <div class="lineDialog"></div>

    <div class="row justify-between items-center">
      <div class="col dataInfo2">{{ title }}</div>
      <div class="col dataInfo2" style="text-align: right">{{ subtitle }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'bluetooth'
    },
    color: {
      type: String,
      default: 'black'
    },
    title: {
      type: String,
      default: 'Title'
    },
    subtitle: {
      type: String,
      default: 'Subtitle'
    },
    val: {
      type: String,
      default: '0'
    }
  }
};
</script>
<style lang="sass" scoped>
.q-avatar
  margin-top: -30px
</style>
