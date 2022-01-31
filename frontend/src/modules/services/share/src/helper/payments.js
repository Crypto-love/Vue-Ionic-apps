function detectCardType(number) {
  /** stripe only support this brand */
  const re = {
    UnionPay: /^(62|88)\d+$/,
    Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    MasterCard: /^5[1-5][0-9]{14}$/,
    'American Express': /^3[47][0-9]{13}$/,
    'Diners Club': /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    JCB: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  for (let key in re) {
    if (re[key].test(number.replace(/ /g, ''))) {
      return key;
    }
  }
  return 'Unknown';
}
function getCardImage(brand) {
  switch (brand) {
    case 'Diners Club':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/diners.svg';
    case 'Discover':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/discover.svg';
    case 'UnionPay':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/unionpay.svg';
    case 'Visa':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/visa.svg';
    case 'MasterCard':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/mastercard.svg';
    case 'American Express':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/amex.svg';
    case 'JCB':
      return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/jcb.svg';
  }
  return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/icons/generic.svg';
}

export const payments = {
  creditCards: {
    detectCardType,
    getCardImage
  },
  eWallets: {}
};
