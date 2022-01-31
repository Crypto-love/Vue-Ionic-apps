import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from 'src/i18n';
import store from '../store/index';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: store.state.lang,
  fallbackLocale: store.state.lang,
  messages
});

export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n;
};

export { i18n };
