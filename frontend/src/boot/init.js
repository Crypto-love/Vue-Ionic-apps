import Vue from 'vue';
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';
import config from 'src/config';

import VueCropper from 'vue-cropper';
import VueTelInput from 'vue-tel-input';
import * as GmapVue from 'gmap-vue';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
import {
  service,
  Socket,
  Api,
  Notice,
  updater,
  Firebase,
  Otp,
  getFont,
  Helper,
  isMobile,
  Img,
  errorNotification,
  Branch,
  CleverTap,
  SentryIO
} from 'services';
import * as store from '../store/index';

/** only for init and you want to use it as global this.$ inside .vue file.
 * Try to keep its minimum, eg: one line
 * */

Vue.use(VueCropper);
Vue.use(VueTelInput);

Vue.use(GmapVue, {
  load: { key: 'AIzaSyDOKYuYymq7eHU7sdu74ca4DCmr2SPD5yw', libraries: 'places,drawing,geometry' }
});

Vue.prototype.$isMobile = isMobile();

Vue.prototype.$s = service;
Vue.prototype.$api = Api;
Vue.prototype.$socket = Socket;
Vue.prototype.$notice = Notice;
Vue.prototype.$dayjs = dayjs;

Vue.prototype.$firebase = new Firebase();
Vue.prototype.$otp = new Otp();
Vue.prototype.$branch = new Branch();
Vue.prototype.$clevertap = new CleverTap();
Vue.prototype.$sentry = new SentryIO();

Vue.prototype.$font = getFont;
Vue.prototype.$helper = new Helper();
Vue.prototype.$Img = Img;
Vue.prototype.$exitApp = Vue.prototype.$helper.exitApp();

String.prototype.upFirstChar = function () {
  return !this ? '-' : this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.removeSpecialCharacter = function () {
  return !this ? '' : this.replace(/[#,/,!,*,",',{,},[,\]]/gi, '');
};

/** run in memory */
updater();

/** watch global error and send to slack */
window.onerror = async (msg, url, line, col, error) => {
  if (line == 0 || col == 0) return;
  let errorMessage = `${store.default.state.ip}location: ${location.pathname}\nerror: ${msg}|${line}:${col}`;
  errorNotification('[FE] FAIL!', errorMessage);
};

/**Sentry integration */
if (config.env != 'development') {
  const DSNurl = config.sentry_DSN_url;
  const traceRate = config.sentry_trace_rate;

  Sentry.init({
    Vue,
    dsn: DSNurl,
    integrations: [new Integrations.BrowserTracing()],
    tracingOptions: {
      trackComponents: true
    },
    environment: config.env,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: traceRate
  });
}
