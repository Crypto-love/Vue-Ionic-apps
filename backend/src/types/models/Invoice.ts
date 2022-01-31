import { objectType } from 'nexus';

export const Invoice = objectType({
  name: 'Invoice',
  definition(t) {
    t.model.id();
    t.model.invoice_id();
    t.model.invoice_number();
    t.model.code();
    t.field('actual_delivery_date', { type: 'Date' });
    t.model.last_user_id();
    t.model.description();
    t.float('amount');
    t.float('cod_paid_amount');
    t.model.payment_type();
    t.model.credit_term();
    t.field('due_date', { type: 'Date' });
    t.model.status_id();
    t.model.resync_status();
    t.model.delivery_address();
    t.model.billing_address();
    t.model.created_at();
    t.model.updated_at();
    t.model.active();
  }
});

export const InvoiceStatus = objectType({
  name: 'InvoiceStatus',
  definition(t) {
    t.model.id();
    t.model.status_name();
    t.model.created_at();
    t.model.updated_at();
    t.model.active();
  }
});

export const Payment = objectType({
  name: 'Payment',
  definition(t) {
    t.model.id();
    t.model.invoice_id();
    t.model.xero_payment_id();
    t.model.xero_account_id();
    t.model.xero_account_name();
    t.float('amount');
    t.model.reference_number();
    t.model.created_by();
    t.model.created_at();
    t.model.updated_by();
    t.model.updated_at();
    t.model.active();
  }
});

export const PeppolInvoice = objectType({
  name: 'PeppolInvoice',
  definition(t) {
    t.model.id();
    t.model.invoice_id();
    t.model.invoice_number();
    t.model.guid();
    t.model.data();
    t.model.storecove_tenant_id();
    t.model.created_at();
    t.model.updated_at();
    t.model.active();
  }
});

export const Statement = objectType({
  name: 'Statement',
  definition(t) {
    t.model.id();
    t.model.phone();
    t.model.sender();
    t.model.filepath();
    t.model.content();
    t.model.status();
    t.model.created_at();
    t.model.updated_at();
  }
});

export const ConsolidationInvoice = objectType({
  name: 'ConsolidationInvoice',
  definition(t) {
    t.int('id');
    t.int('tenant_id');
    t.string('xero_invoice_id');
    t.field('delivery_date', { type: 'Date' });
    t.string('invoice_number');
    t.int('group_id');
    t.string('amount');
    t.string('buyer_name');
  }
});

export const StatusUploadInvoice = objectType({
  name: 'StatusUploadInvoice',
  definition(t) {
    t.list.string('success');
    t.list.string('fail');
  }
});
