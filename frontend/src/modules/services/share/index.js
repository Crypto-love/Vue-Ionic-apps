import { Branch } from './src/helper/branch';
import { cipher, decipher } from './src/helper/cipher';
import { CleverTap } from './src/helper/clevertap';
import { disableYesterdayDates, getCustomString, getDateCode } from './src/helper/date';
import { errorNotification } from './src/partial/errorNotification';
import { FB } from './src/helper/fb';
import { fileToBase64 } from './src/helper/file';
import { Firebase } from './src/helper/firebase';
import {
  generateInvoice,
  generateCashCollection,
  generateDeliverySchedule,
  generatePickingList,
  generatePurchaseOrder,
  generateStatement,
  generatePickingCollection
} from './src/pdf/index';
import { getFont } from './src/helper/font';
import { getPublicDetail } from './src/helper/network';
import { Helper } from './src/helper/helper';
import { ImportXlxs, dataToCSV } from './src/helper/excel';
import {
  isEmailValid,
  isNumeric,
  isDecimalPlaceValid,
  isPeppolIdentifier,
  isCreditCardNumber,
  required,
  numeric,
  decimalPlace,
  greaterThan,
  isValidName,
  isValidCountry,
  isWhiteSpace
} from './src/helper/formValidation';
import { isLogged, hasCustomer, introCompleted, isMobile, app_type, state } from './src/helper/auth';
import { Otp } from './src/helper/Otp';
import { payments } from './src/helper/payments';
import { resizeImg, scaleImg, Img } from './src/helper/image';
import { SentryIO } from './src/helper/sentry';
import { service, Api, Socket, Notice } from './src/helper/services';
import { signupNotif } from './src/partial/signupNotif';
import { updater, clearCache, showLoader, hideLoader, updateApp, compareVersion } from './src/helper/updater';
import { Voucher } from './src/partial/voucher';

/** make sure to use this libraries only for any FE Usage */
export {
  Api,
  app_type,
  Branch,
  cipher,
  clearCache,
  CleverTap,
  compareVersion,
  dataToCSV,
  decimalPlace,
  decipher,
  disableYesterdayDates,
  errorNotification,
  FB,
  fileToBase64,
  Firebase,
  generateCashCollection,
  generateDeliverySchedule,
  generateInvoice,
  generatePickingCollection,
  generatePickingList,
  generatePurchaseOrder,
  generateStatement,
  getCustomString,
  getDateCode,
  getFont,
  getPublicDetail,
  greaterThan,
  hasCustomer,
  Helper,
  hideLoader,
  Img,
  ImportXlxs,
  introCompleted,
  isCreditCardNumber,
  isDecimalPlaceValid,
  isEmailValid,
  isLogged,
  isMobile,
  isNumeric,
  isPeppolIdentifier,
  Notice,
  numeric,
  Otp,
  payments,
  required,
  resizeImg,
  scaleImg,
  SentryIO,
  service,
  showLoader,
  signupNotif,
  Socket,
  state,
  updateApp,
  updater,
  isValidName,
  isValidCountry,
  isWhiteSpace,
  Voucher
};

/** expose all graphql object */
// export * from './src/graphql'; //user quasar config to export this
