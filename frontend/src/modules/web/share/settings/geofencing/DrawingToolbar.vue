<template>
  <div class="drawing-toolbar">
    <div>
      <button class="drawing-button" @click="$emit('drawingmode_changed', 'polygon')">Polygon</button>
    </div>
    <div>
      <button class="drawing-button" @click="$emit('delete_selection')">Delete</button>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.drawing-toolbar {
  background-color: #040404;
  display: flex;
  position: fixed;
  right: 0;
  padding: 8px;
}

.drawing-button {
  border-radius: 10px;
  margin: 0 2px;
}
</style>
