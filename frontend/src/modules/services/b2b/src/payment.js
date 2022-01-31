import { Api, Notice } from '../../share/index';
import * as Store from '../../../../store/index';
import { Branch } from '../../share/src/helper/branch';

const store = Store.default.state;

async function getCustomer(id) {
  return await Api.get(`st_customers/${id}`);
}
async function addCustomer(fullname, phone, email) {
  return await Api.add(`st_customers`, {
    name: fullname,
    phone: phone,
    email: email
  });
}
async function updateCustomer(id, fullname, phone, email) {
  return await Api.update(
    `st_customers`,
    {
      name: fullname,
      phone: phone,
      email: email
    },
    id
  );
}
async function getCard(customer_id, id) {
  return await Api.get(`st_customers/${customer_id}/sources/${id}`);
}
async function addPayment(card_number, exp_month, exp_year, cvv) {
  return await Api.add(`st_payment_methods`, {
    type: 'card',
    'card[number]': card_number,
    'card[exp_month]': exp_month,
    'card[exp_year]': exp_year,
    'card[cvc]': cvv
  });
}
async function addToken(card_number, exp_month, exp_year, cvv) {
  return await Api.add(`st_tokens`, {
    'card[number]': card_number,
    'card[exp_month]': exp_month,
    'card[exp_year]': exp_year,
    'card[cvc]': cvv
  });
}
async function attachPayment(payment_id, customer_id) {
  return await Api.add(`st_payment_methods/${payment_id}/attach`, {
    customer: customer_id
  });
}
async function setSource(card_token_id, customer_id) {
  return await Api.add(`st_customers/${customer_id}/sources`, {
    source: card_token_id
  });
}
async function updateCard(customer_id, card_id, card_name, exp_month, exp_year) {
  return await Api.update(
    `st_customers/${customer_id}/sources`,
    {
      source: {
        name: card_name,
        exp_month: exp_month,
        exp_year: exp_year
      }
    },
    card_id
  );
}
async function getCharge(id) {
  return await Api.get(`st_charges/${id}`);
}
async function addCharge(customer_id, amount, user_email) {
  const payload = {
    customer: customer_id,
    currency: store.currency_code ? store.currency_code : 'SGD',
    amount: Number(amount).toFixed() /** convert into cents */,
    receipt_email: user_email,
    'payment_method_types[]': 'card',
    'metadata[logged_in_user_first_name]': store.first_name,
    'metadata[logged_in_user_last_name]': store.last_name,
    'metadata[logged_in_user_version]': store.version,
    'metadata[logged_in_user_mobile]': store.mobile,
    'metadata[logged_in_user_email]': store.email,
    'metadata[logged_in_user_username]': store.username,
    'metadata[logged_in_user_selected_company_name]':
      store.selectedCompany && store.selectedCompany.name ? store.selectedCompany.name : '',
    'metadata[logged_in_user_selected_company_id]':
      store.selectedCompany && store.selectedCompany.id ? store.selectedCompany.id : ''
  };
  !payload.receipt_email && delete payload.receipt_email;
  return await Api.add(`st_payment_intents`, payload);
}
async function addHoldCharge(customer_id, card_id, amount, user_email) {
  const payload = {
    customer: customer_id,
    currency: store.currency_code ? store.currency_code : 'SGD',
    amount: Number(amount).toFixed() /** convert into cents */,
    receipt_email: user_email,
    confirm: true,
    capture_method: 'manual',
    'payment_method_types[]': 'card',
    payment_method: card_id,
    'metadata[logged_in_user_first_name]': store.first_name,
    'metadata[logged_in_user_last_name]': store.last_name,
    'metadata[logged_in_user_version]': store.version,
    'metadata[logged_in_user_mobile]': store.mobile,
    'metadata[logged_in_user_email]': store.email,
    'metadata[logged_in_user_username]': store.username,
    'metadata[logged_in_user_selected_company_name]':
      store.selectedCompany && store.selectedCompany.name ? store.selectedCompany.name : '',
    'metadata[logged_in_user_selected_company_id]':
      store.selectedCompany && store.selectedCompany.id ? store.selectedCompany.id : ''
  };
  !payload.receipt_email && delete payload.receipt_email;
  return await Api.add(`st_payment_intents`, payload);
}
async function captureCharge(pi_id, amount) {
  const payload = {
    amount_to_capture: amount
  };
  return await Api.add(`st_payment_intents/${pi_id}/capture`, payload);
}

async function cancelHoldCharge(pi_id, message) {
  const payload = {
    cancellation_reason: message
  };
  return await Api.add(`st_payment_intents/${pi_id}/cancel`, payload);
}

async function updateCharge(pi_id, description) {
  return await Api.add(`st_payment_intents/${pi_id}`, {
    description: description
  });
}
async function confirmCharge(pi_id, card_id) {
  return await Api.add(`st_payment_intents/${pi_id}/confirm`, {
    payment_method: card_id
  });
}
async function addRefund(charge_id) {
  return await Api.add(`st_refunds`, {
    charge: charge_id
  });
}

function detectCardType(number) {
  /** stripe only support this brand */
  var re = {
    UnionPay: /^(62|88)\d+$/,
    Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    MasterCard: /^5[1-5][0-9]{14}$/,
    'American Express': /^3[47][0-9]{13}$/,
    'Diners Club': /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    JCB: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  for (var key in re) {
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

async function saveUserCard(user, card) {
  let user_card = {
    stripe_customer_id: null,
    stripe_card_id: null
  };
  if (!user) {
    Notice.fail('Invalid User Detail!');
    return user_card;
  }

  if (!card) {
    Notice.fail('Invalid Card Detail!');
    return user_card;
  }

  if (!user.stripe_customer_id) {
    const customer = await addCustomer(`${user.first_name} ${user.last_name}`, user.phone, user.email);
    if (!customer.status) {
      Notice.fail('Adding Customer Fail!');
      return user_card;
    }

    if (customer.data.length <= 0) {
      Notice.fail('No Customer Detail!');
      return user_card;
    } else if (customer.data[0].error) {
      Notice.fail(customer.data[0].error.message);
      return user_card;
    }

    user_card.stripe_customer_id = customer.data[0].id;

    const saveCustomer = await Api.update(
      'users',
      { stripe_customer_id: user_card.stripe_customer_id },
      user.id
    );
    if (!saveCustomer.status) {
      Notice.fail('Updating Customer Fail!');
      return user_card;
    }
  } else {
    user_card.stripe_customer_id = user.stripe_customer_id;
  }

  const newCard = await addToken(card.card_number, card.exp_month, card.exp_year, card.cvv);

  if (!newCard.status) {
    Notice.fail('Adding Card Fail!');
    return user_card;
  }

  if (newCard.data.length <= 0) {
    Notice.fail('No Card Detail!');
    return user_card;
  } else if (newCard.data[0].error) {
    Notice.fail(newCard.data[0].error.message);
    return user_card;
  }

  let token_id = newCard.data[0].id;

  const source = await setSource(token_id, user_card.stripe_customer_id);

  if (!source.status) {
    Notice.fail('Set Card Fail!');
    return user_card;
  }
  if (source.data.length <= 0) {
    Notice.fail('No Card Set!');
    return user_card;
  } else if (source.data[0].error) {
    Notice.fail(source.data[0].error.message);
    return user_card;
  }

  user_card.stripe_card_id = newCard.data[0].card.id;

  const branch = new Branch();
  branch.sendAddPaymentInfoEvent({
    brand: source.data[0].brand,
    country: source.data[0].country,
    funding: source.data[0].funding
  });

  if (!user.stripe_customer_id) {
    const saveCardCustomer = await Api.update('users', { stripe_card_id: user_card.stripe_card_id }, user.id);

    if (!saveCardCustomer.status) {
      Notice.fail('Update Card Fail!');
      return user_card;
    }
  }

  Notice.ok('Adding Card Succesful!');
  return user_card;
}

async function setDefaultCard(customerId, cardId) {
  return await Api.update(
    `st_customers`,
    {
      default_source: cardId
    },
    customerId
  );
}

async function deleteCard(customerId, cardId) {
  return await Api.delete(`st_customers/${customerId}/sources/${cardId}`);
}

export const stripe = {
  getCustomer,
  addCustomer,
  updateCustomer,
  getCard,
  addToken,
  addPayment,
  attachPayment,
  updateCard,
  setSource,
  getCharge,
  addCharge,
  addHoldCharge,
  cancelHoldCharge,
  captureCharge,
  updateCharge,
  confirmCharge,
  detectCardType,
  getCardImage,
  saveUserCard,
  setDefaultCard,
  deleteCard
};
