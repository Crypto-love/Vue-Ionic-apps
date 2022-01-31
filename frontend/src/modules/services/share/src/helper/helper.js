import Vue from 'vue';
import { date, Loading } from 'quasar';
import { env, images, images_uat } from 'src/config';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import weekday from 'dayjs/plugin/weekday';
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import SendBirdService from './sendbird';
import * as Store from '../../../../../store/index';

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(weekYear);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export class Helper {
  isOpenDialog = false;

  getGenderName = (gender) => {
    return gender.toLowerCase() == 'f' ? 'Female' : gender.toLowerCase() == 'm' ? 'Male' : '-';
  };

  getGenders = () => {
    return [
      {
        code: 'm',
        label: 'Male'
      },
      {
        code: 'f',
        label: 'Female'
      }
    ];
  };

  getPositions = () => {
    return ['Operation', 'Key Contact', 'Finance'];
  };

  getCustomerProfiles = () => {
    return [
      'Catering',
      'Restaurant',
      'NPO',
      'Hotel',
      'Wholesale',
      'Corporate',
      'Hawkers',
      'Hawkers (High Frequency)',
      'Manufacturer',
      'Other'
    ];
  };

  getTenantLevels = () => {
    return [
      {
        id: 1,
        name: 'Seed'
      },
      {
        id: 2,
        name: 'Sprout'
      }
    ];
  };

  getCreditPayments = () => {
    return [
      {
        label: 'COD',
        value: 0
      },
      {
        label: '7 Days',
        value: 1
      },
      {
        label: '15 Days',
        value: 2
      },
      {
        label: '30 Days',
        value: 3
      },
      {
        label: 'Others',
        value: 4
      }
    ];
  };

  getPaymentTypes = () => {
    return [
      {
        label: 'Bank Transfer',
        value: 0
      },
      {
        label: 'Collection',
        value: 1
      },
      {
        label: 'Credit Card',
        value: 2
      }
    ];
  };

  getInvoicePaymentTypes = () => {
    return [
      {
        id: 1,
        xero_account_id: '06d91ad4-4618-40e2-916a-9339b21335dc', // Xero account id for Cash Payment
        label: 'Cash Payment'
      },
      {
        id: 2,
        xero_account_id: '485803cc-7b2c-4f93-850f-abd3ed9d679f', // Xero account id for DBS Bank
        label: 'Bank Transfer'
      },
      {
        id: 3,
        xero_account_id: '485803cc-7b2c-4f93-850f-abd3ed9d679f', // Xero account id for DBS Bank
        label: 'Cheque'
      }
    ];
  };

  getPhoneString(phone) {
    let tempPhone = phone;
    if (phone.length <= 8) {
      tempPhone = `+65${tempPhone}`;
    }
    if (tempPhone.indexOf('+') !== 0) {
      tempPhone = `+${tempPhone}`;
    }
    return tempPhone;
  }

  getMoneyString(value) {
    let formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return formatter.format(value);
  }

  containDuplicate = (arr) => {
    if (!Array.isArray(arr)) return false;

    let distinct = arr.filter((a, b, c) => {
      return c.indexOf(a) === b;
    });
    return arr.length != distinct.length ? true : false;
  };

  formatDate(dateYMD) {
    let newDate = date.extractDate(dateYMD, 'YYYY-MM-DD');
    return date.formatDate(newDate, 'D MMM YYYY');
  }

  formatDateTime(dateYMD) {
    let newDate = date.extractDate(dateYMD, 'YYYY-MM-DD HH:mm:ss');
    return date.formatDate(newDate, 'D MMM YYYY HH:mm');
  }

  getFormatedAddress(address) {
    let res = '';

    let floor = null;
    if (!address.floor_number && address.unit) floor = address.unit;
    else if (address.floor_number && !address.unit) floor = `Level ${address.floor_number}`;
    else if (address.floor_number && address.unit) floor = `#${address.floor_number}-${address.unit}`;

    res += address.street_number ? ` ${address.street_number},` : '';
    res += address.road ? ` ${address.road},` : '';
    res += floor ? ` ${floor},` : '';
    res += address.building ? ` ${address.building},` : '';
    res += address.stall ? ` ${address.stall},` : '';
    res += address.city ? ` ${address.city},` : '';
    res += address.state ? ` ${address.state},` : '';
    res += address.postal_code ? ` ${address.postal_code}` : '';

    return res;
  }

  exitApp() {
    if (navigator.app && typeof navigator.app.exitApp === 'function') {
      navigator.app.exitApp();
    } else if (
      typeof cordova != 'undefined' &&
      cordova.plugins &&
      typeof cordova.plugins.exit === 'function'
    ) {
      cordova.plugins.exit();
    } else {
    }
  }

  getDefaultCountryCode() {
    return 65;
  }

  getPreferedCountryCode() {
    const countryCode = ['SG', 'MY'];
    return env == 'development' ? [...countryCode, 'ID'] : countryCode;
  }

  /**
   * Find object inside array of object by key and value
   * @param {List<Object>} data
   * @param {String} key
   * @param {Any} value
   */
  findObjectByKey(dataList, key, value) {
    return dataList.find((v) => v[key] == value);
  }

  displayPrice(price) {
    return parseFloat(Math.round(Number(price) * 100) / 100).toFixed(2);
  }

  display4DpPrice(price) {
    return parseFloat(Math.round(Number(price) * 10000) / 10000).toFixed(4);
  }

  /**
   * Adjust data structure of V3 credential to V2 credential
   */
  adjustUserCredential(response) {
    let convertedResponse = { ...response };

    convertedResponse = {
      ...convertedResponse,
      menus: null,
      country_id: response.country?.id || null,
      country_code: response.country?.name || null,
      country: response.country?.description || null,
      currency_code: response.country?.currency_code || null,
      currency_symbol: response.country?.currency_symbol || null,
      user_type: response.type?.name || null,
      tenant_id: response.tenant?.id || null,
      tenant_customer_id: response.tenant?.tenant?.id || null,
      tenant: response.tenant?.tenant?.name || null,
      xero_tenant_id: [1, 2, 4, 7].includes(response.user_type_id)
        ? response.tenant?.xeroIntegration?.xero_tenant_id || null
        : null
    };

    return convertedResponse;
  }

  getGraphqlErrorMessage({ graphQLErrors, networkError }) {
    if (graphQLErrors && graphQLErrors.length > 0) return graphQLErrors[0].message;
    else if (networkError) return networkError.result.errors[0].message;
    return 'An error occurred';
  }

  displayPriceWithTax(price, tax_rate) {
    let tax = 0;
    let total_price = 0;
    tax_rate = parseFloat(tax_rate) / 100;
    let p = parseFloat(price);
    tax = parseFloat(p * tax_rate);
    total_price = parseFloat(p + parseFloat(tax));
    return total_price.toFixed(2);
  }

  /* input: any iso date input
     output: 'YYYY-MM-DD' date format*/
  /**
   * @param {Date} inDateTime The date
   */
  getDateFromISODate(inDate) {
    let res;
    let newDate = inDate.substring(0, 10);
    res = dayjs(newDate).format('YYYY-MM-DD');
    return res;
  }

  /* input: any iso datetime input
     output: 'YYYY-MM-DD HH:mm:ss' datetime format*/
  /**
   * @param {DateTime} inDateTime The date
   */
  getDateTimeFromISODate(inDateTime) {
    let res;
    let newDate = inDateTime.substring(0, 10);
    let newTime = inDateTime.substring(11, 19);
    res = dayjs(newDate.concat(' ', newTime)).format('YYYY-MM-DD HH:mm:ss');
    return res;
  }

  /* input: any datetime input
     output: iso datetime format*/
  /**
   * @param {ISODateTime} inDateTime The date
   */
  getISODateFromDateTime(inDateTime = undefined) {
    if (!inDateTime) return new Date().toISOString();
    return new Date(inDateTime).toISOString();
  }

  logout() {
    function clearLocalStorage() {
      Store.default.commit('clearStore');
      location.replace('/');
    }
    const isIosApp = Vue.prototype.$q.platform.is.ios && Vue.prototype.$firebase.isAvailable();

    Loading.show();

    if (isIosApp) SendBirdService.unsetChatPushNotification(clearLocalStorage);
    else clearLocalStorage();
  }

  customToFixed2(subTotal) {
    return Number((subTotal * 100).toString().split('.')[0] / 100).toFixed(2);
  }

  truncateText(originalText, length) {
    return originalText?.length > length ? `${originalText.substring(0, length)}...` : originalText;
  }
}
