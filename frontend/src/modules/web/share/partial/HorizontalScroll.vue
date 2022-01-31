<template>
  <div>
    <div class="text-caption text-primary">
      <strong>{{ title }}</strong>
    </div>
    <div class="row my-row q-py-sm">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.my-row {
  flex-wrap: nowrap;
  overflow-x: scroll;
}
/* width */
::-webkit-scrollbar {
  /* height: 5px; */
  display: none;
}

/* Track */
/* ::-webkit-scrollbar-track {
  background: #f1f1f1;
} */

/* Handle */
/* ::-webkit-scrollbar-thumb {
  background: #888;
} */

/* Handle on hover */
/* ::-webkit-scrollbar-thumb:hover {
  background: #555;
} */
</style>
