export const isEmailValid = (text) => {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(text);
};

export const isNumeric = (text) => {
  if (!/\S/.test(text)) return false;
  return !isNaN(text);
};

const countDecimals = function (value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

export const isDecimalPlaceValid = function (v, expectedLength) {
  const count = countDecimals(v);
  return count <= expectedLength;
};

export const isCreditCardNumber = (text) => {
  const regex = /\d{4} \d{4} \d{4} \d{3}/g;
  return regex.test(text);
};

export const isPeppolIdentifier = (text) => {
  const regex = /^SGUEN\w{9,10}$|^[A-Z]{2}UID\w{8,25}$|^[A-Z]{2}SSM\w{8,25}$|^[A-Z]{2}TST\w{8,25}$|^SGECHOTEST\d{2}$/;
  return regex.test(text);
};

export const required = (message = 'Cannot be empty') => {
  return [(v) => !!v || message];
};

export const numeric = (message = 'Must be a numeric') => {
  return [
    (v) => {
      if (v && !isNumeric(v)) {
        return message;
      }
      return true;
    }
  ];
};

/**
 *
 * @param {number} decimalPlace
 */
export const decimalPlace = (decimalPlace) => {
  return [
    ...numericRule(),
    (v) => isDecimalPlaceValid(v, decimalPlace) || `Must have ${decimalPlace} decimal points`
  ];
};

/**
 *
 * @param {number} n
 */
export const greaterThan = (n) => {
  return [
    (v) => {
      if (v && v <= n) {
        return `Must be more than ${n}`;
      }
      return true;
    }
  ];
};

/**
 *
 * @param {string} n
 */
export const isValidName = (val) => {
  if (!/\S/.test(val)) return false;
  const Pattern = /^[A-Za-z ,.'-]+$/i;
  return Pattern.test(val);
};

/**
 *
 * @param {number} n
 */
export const isValidCountry = (val) => {
  const Pattern = [193, 127]; //currenct Support Country
  return Pattern.includes(val);
};

/**
 *
 * @param {string} n
 */
export const isWhiteSpace = (val) => {
  return /\S/.test(val);
};
