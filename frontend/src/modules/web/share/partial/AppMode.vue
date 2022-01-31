<template>
  <div v-show="getMode !== 'PRODUCTION'" class="cr cr-top cr-left cr-sticky">{{ getMode }}</div>
</template>
<script>
import { env } from 'src/config';

export default {
  name: 'AppMode',
  computed: {
    getMode() {
      switch (env) {
        case 'production':
          return 'PRODUCTION';
        case 'backup':
          return 'BACKUP';
        case 'staging':
          return 'STAGE';
        case 'testing':
          return 'TEST';
      }
      return 'DEVELOPMENT';
    }
  }
};
</script>
<style scoped>
.cr {
  opacity: 0.6;
  width: 170px;
  padding: 5px;
  position: absolute;
  text-align: center;
  color: #f0f0f0;
  background-color: #062e26;
  font-size: 10px;
  letter-spacing: 2px;
  -webkit-animation: 1.5s ease 0s infinite beat;
  -ms-animation: 1.5s ease 0s infinite beat;
  animation: 1.5s ease 0s infinite beat;
}

.cr-sticky {
  position: fixed;
}

/* Positions */

.cr-top {
  top: 25px;
}
.cr-bottom {
  bottom: 25px;
}
.cr-left {
  left: -50px;
}
.cr-right {
  right: -50px;
}

/* Rotations */

.cr-top.cr-left,
.cr-bottom.cr-right {
  transform: rotate(-45deg);
}

.cr-top.cr-right,
.cr-bottom.cr-left {
  transform: rotate(45deg);
}

@keyframes beat {
  0%,
  50%,
  100% {
    -webkit-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
  30%,
  80% {
    -webkit-transform: rotate(-46deg);
    -ms-transform: rotate(-46deg);
    transform: rotate(-46deg);
  }
}
</style>
