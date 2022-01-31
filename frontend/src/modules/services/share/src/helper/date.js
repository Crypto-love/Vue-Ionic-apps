import dayjs from 'dayjs';
import Vue from 'vue';

export const disableYesterdayDates = (date) => {
  return date >= Vue.prototype.$dayjs().add(-3, 'day').format('YYYY/MM/DD');
};

export function getCustomString(date) {
  return dayjs(date).format('DD MMM YYYY');
}

/**
 *
 * @param {string} date
 */
export function getDateCode(date) {
  return dayjs(date).format('YYYYMMDDHHMM');
}
