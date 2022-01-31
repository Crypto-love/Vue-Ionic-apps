import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import weekday from 'dayjs/plugin/weekday';
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(weekYear);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export function displayPriceWithTax(price, tax_rate) {
  let tax = 0;
  let total_price = 0;
  tax_rate = parseFloat(tax_rate) / 100;
  let p = parseFloat(price);
  tax = Number(p * tax_rate).toFixed(2);
  total_price = parseFloat(p + parseFloat(tax));
  return total_price.toFixed(2);
}

export function displayPrice(price) {
  let p = parseFloat(price);
  return p;
}

export function displaySubTotal(data) {
  return Number(data.map((v) => Number(v.price * v.quantity)).reduce((total, v) => total + v, 0)).toFixed(2);
}

export function displaySubTotalWithTax(data, tax_rate) {
  let total = 0;
  let tax = 0;
  let result = 0;
  tax_rate = parseFloat(tax_rate) / 100;

  data.forEach((value, index) => {
    total = value.price * value.quantity;
    tax = Number(total * tax_rate).toFixed(2);
    result += total + tax;
  });
  return Number(result);
}

export function getCurrentWeekCode() {
  let result = 0;
  let curDay = dayjs().weekday();
  if (curDay == 0) {
    result = dayjs().week() - 1;
  } else {
    result = dayjs().week();
  }
  if (result == 0) {
    result = dayjs(date).isoWeeksInYear() - 1;
  }
  return result - 1;
}

export function getCurrentWeekCodebydate(date) {
  let result = 0;
  let curDay = dayjs(date).weekday();
  if (curDay == 0) {
    result = dayjs(date).week() - 1;
  } else {
    result = dayjs(date).week();
  }
  if (result == 0) {
    result = dayjs(date).isoWeeksInYear() - 1;
  }
  return result - 1;
}

export const helper = {
  displaySubTotalWithTax,
  displaySubTotal,
  displayPrice,
  displayPriceWithTax,
  getCurrentWeekCode,
  getCurrentWeekCodebydate
};
