import Vue from 'vue';
import store from '../../../../../store/index';
import { Firebase } from '../helper/firebase';

const firebase = new Firebase();

export function isLogged() {
  return store.state.id > 0 ? true : false;
}
export function state() {
  return store.state;
}
export function hasCustomer() {
  return store.state.selectedCompany ? true : false;
}
export function introCompleted() {
  return store.state.introOpened ? true : false;
}

export function isMobile() {
  return Vue.prototype.$q.platform.is.mobile || firebase.isAvailable() ? true : false;
}

export function app_type() {
  return Vue.prototype.$q.platform.is.mobile || firebase.isAvailable() ? 'mobile' : 'web';
}
