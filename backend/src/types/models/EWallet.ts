import { objectType } from 'nexus';
import { DecimalScalar } from './Scalar';

export const EWallet = objectType({
  name: 'EWallet',
  definition(t) {
    t.model.id();
    t.model.xfers_customer_id();
    t.model.currency_code();
    t.model.currency_symbol();
    t.model.created_at();
    t.model.updated_at();
    t.model.locked_balance();
    t.model.active();
  }
});

export const EWalletTransactionType = objectType({
  name: 'EWalletTransactionType',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.active();
  }
});

export const EWalletTransactionStatus = objectType({
  name: 'EWalletTransactionStatus',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.active();
  }
});

export const EWalletTransaction = objectType({
  name: 'EWalletTransaction',
  definition(t) {
    t.model.id();
    t.model.e_wallet_id();
    t.model.transaction_type_id();
    t.model.transaction_status_id();
    t.model.xfers_payment_id();
    t.model.amount();
    t.model.description();
    t.model.created_at();
    t.model.updated_at();
    t.model.active();
    t.model.eWallet();
    t.model.type();
    t.model.status();
  }
});

export const EWalletBalance = objectType({
  name: 'EWalletBalance',
  definition(t) {
    t.field('available', { type: DecimalScalar });
    t.field('locked', { type: DecimalScalar });
    t.field('pending_withdraw', { type: DecimalScalar });
  }
});
