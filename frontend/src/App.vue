<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { updateApp, getPublicDetail } from 'services';

export default {
  name: 'App',

  async created() {
    /** check web version on desktop and mobile */
    await updateApp();

    /** get public detail */
    const result = await getPublicDetail();
    if (result && Array.isArray(result) && result.length > 10) {
      let state = this.$store.state;
      let publicDetail = `device: ${result[5].replace('uag=', '')}\nip: ${result[2].replace(
        'ip=',
        ''
      )}\nversion: ${state.version}\nfullname: ${state.first_name} ${state.last_name}\n`;
      this.$store.commit('setIp', publicDetail);
    }
  }
};
</script>
