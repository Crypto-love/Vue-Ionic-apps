<template>
  <div :class="`card-body row justify-center bg-${bgColor}`">
    <div :class="`image-container bg-${avatarBgColor} justify-center items-center`">
      <img :src="src" width="100" height="100" v-if="avatar && src" alt="" />
      <img
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
        width="100"
        height="100"
        v-else-if="avatar && !src"
        alt="treedots"
      />
      <q-icon :name="iconName" color="white" size="xl" v-else />
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    avatar: {
      type: Boolean,
      default: false
    },
    src: {
      type: String,
      default: null
    },
    avatarBgColor: {
      type: String,
      default: 'green'
    },
    iconName: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: 'white'
    }
  }
};
</script>

<style scoped>
img {
  border-radius: 50%;
  object-fit: cover;
}
.card-body {
  min-height: 130px;
  border-radius: 16px;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.13);
  margin-top: 60px;
}
.image-container {
  width: 100px;
  height: 100px;
  /* position: relative; */
  transform: translateX(0%) translateY(-50%);
  border-radius: 100px;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}
.content {
  width: 85%;
  margin-top: -40px;
}
</style>
