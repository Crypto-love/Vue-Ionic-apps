import Vue from 'vue';
import { Api } from './services';
import * as Store from '../../../../../store/index';
import { interval } from 'src/config';
import { Dialog, Platform } from 'quasar';
import AlertMessage from 'web/share/partial/AlertMessage';
import { apolloProvider } from 'boot/apollo';
import { requestJWT, me, getVersions } from 'treeGQL';

let fetchingUserData = false;

export const updater = function () {
  let timeout = interval || 60 * 1000 * 10; /** run every 10 minutes */

  setInterval(() => {
    updateApp();
  }, timeout);
};

export async function updateApp() {
  if (!fetchingUserData) {
    fetchingUserData = true;
    const data = await new Promise((resolve, reject) => {
      return apolloProvider.defaultClient
        .query({
          query: getVersions
        })
        .then((res) => {
          resolve(res?.data?.getVersions);
        })
        .catch((err) => {
          Vue.prototype.$q.dialog({
            parent: Vue.prototype,
            component: AlertMessage,
            title: 'failed',
            message: Vue.prototype.$helper.getGraphqlErrorMessage(err),
            buttonText: 'close'
          });
          reject(err);
        });
    });
    if (data.length > 0) {
      let dbVersion = Number(data[0].VERSION || 0);
      let localVersion = Number(Store.default.state.version || 0);
      if (dbVersion > localVersion) {
        showPopUp(Store.default.state.id, dbVersion);
      } else {
        fetchingUserData = false;
      }
    }
  }
}
async function showPopUp(user_id, newVersion) {
  Dialog.create({
    title: 'Update Available',
    message: 'There are new updates for the app!',
    component: AlertMessage,
    buttonText: 'Okay'
  }).onDismiss(async () => {
    /** show native loader */
    showLoader('We are improving your experience. Please wait..');
    /** update the localstorage only if already have id / logged */
    if (user_id) {
      /** Request JWT due to switching V2 to V3 */
      if (Store.default.state.token && !Store.default.state.tokenJWT) await requestTokenJWT();

      /** Update user profile */
      await updateUserProfile();

      Store.default.commit('setCustomer', null);

      /** If user is B2C user dont reset selectedcompany data */
      if (Store.default.state.buyer_type != 2) Store.default.commit('setCompany', null);
      Store.default.commit('setCart', {});
    }

    Store.default.commit('setVersion', newVersion);

    /** update user latest version into user_sessions, so we can see which user are updated or not in our DB */
    updateUserVersion(user_id, newVersion);

    /** clear our cache, maybe should improve later if its not working */
    clearCache();

    /** hide native loader */
    hideLoader();

    /** go to main route, will redirect as per normal flow. eg: in mobile will re-select customer */
    fetchingUserData = false;
    let path = ['/confirmation-order'].includes(location.pathname) ? location.href : '/main';
    location.replace(path);
  });
}

async function updateUserVersion(userid, currentVersion) {
  return await Api.update(
    'user_sessions',
    {
      version: currentVersion
    },
    userid
  );
}

export function clearCache(isIntroOpen) {
  if ('caches' in window) {
    window.caches.keys().then(function (cacheNames) {
      caches.delete(cacheNames).then(function (boolean) {});
    });
  }
}

export function showLoader(message) {
  try {
    if (Platform.is.android) window.NativeHandler.showIndicator(message);
    else if (Platform.is.ios)
      window.webkit.messageHandlers.showIndicator.postMessage({
        message: message
      });
  } catch (err) {}
}

export function hideLoader() {
  try {
    if (Platform.is.android) window.NativeHandler.hideIndicator();
    else if (Platform.is.ios) window.webkit.messageHandlers.hideIndicator.postMessage('');
  } catch (err) {}
}

export function compareVersion(v1, v2) {
  if (typeof v1 !== 'string') return false;
  if (typeof v2 !== 'string') return false;
  v1 = v1.split('.');
  v2 = v2.split('.');
  const k = Math.min(v1.length, v2.length);
  for (let i = 0; i < k; ++i) {
    v1[i] = parseInt(v1[i], 10);
    v2[i] = parseInt(v2[i], 10);
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}

export async function requestTokenJWT() {
  console.log('Requesting jwt..');
  const response = await apolloProvider.defaultClient
    .mutate({
      mutation: requestJWT,
      variables: {
        oldToken: Store.default.state.token
      }
    })
    .then(async (res) => res)
    .catch((err) => err);

  if (response?.data?.requestJWT) {
    const data_to_store = Vue.prototype.$helper.adjustUserCredential(response.data.requestJWT);
    Store.default.commit('setUser', data_to_store);
  } else {
    console.log('requestJWT fail');
    Vue.prototype.$helper.logout();
  }
}

export async function updateUserProfile() {
  console.log('Requesting profile..');
  const response = await apolloProvider.defaultClient
    .mutate({
      mutation: me
    })
    .then(async (res) => res)
    .catch((err) => err);

  if (response?.data?.me) {
    const data_to_store = Vue.prototype.$helper.adjustUserCredential({
      ...response.data.me,
      token: Store.default.state.token,
      tokenJWT: Store.default.state.tokenJWT
    });
    Store.default.commit('setUser', data_to_store);
  } else {
    console.log('getProfile fail');
    Vue.prototype.$helper.logout();
  }
}
