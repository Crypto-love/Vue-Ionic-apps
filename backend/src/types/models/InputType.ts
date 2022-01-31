import { inputObjectType, list, extendType } from 'nexus';

export const CartItemInputType = inputObjectType({
  name: 'CartItemInput',
  definition(t) {
    t.int('customer_id');
    t.nonNull.int('sku_id');
    t.nonNull.decimal('price');
    t.nonNull.int('order_quantity');
    t.nonNull.decimal('order_weight');
  }
});

export const TenantInputType = inputObjectType({
  name: 'TenantInput',
  definition(t) {
    t.nonNull.string('account_number');
    t.nonNull.string('name');
    t.nonNull.string('alias_name');
    t.nonNull.int('customer_type_id');
    t.nonNull.int('collection_type_id');
    t.nonNull.string('delivery_instruction');
    t.nonNull.decimal('delivery_charge');
    t.nonNull.int('payment_type');
    t.nonNull.decimal('minimum_order');
    t.nonNull.boolean('hub');
    t.nonNull.boolean('halal_products');
    t.nonNull.boolean('cod');
    t.nonNull.int('credit_term');
    t.nonNull.string('xero_id');
    t.nonNull.string('voucherify_id');
    t.nonNull.boolean('active');
    t.nonNull.string('profile');
    t.nonNull.string('registration_number');
    t.nonNull.string('tax_registration_number');
    t.nonNull.decimal('tax_rate');
    t.nonNull.string('email');
    t.nonNull.string('first_name');
    t.nonNull.string('last_name');
    t.nonNull.int('email_notification');
    t.nonNull.int('class_id');
    t.nonNull.int('default_credit_card_term');
  }
});
export const DeliveryDayInputType = inputObjectType({
  name: 'DeliveryDayInput',
  definition(t) {
    t.int('customer_id');
    t.int('day_id');
    t.int('id');
  }
});

export const UserAndPersonInputType = inputObjectType({
  name: 'UserAndPersonInput',
  definition(t) {
    t.nonNull.string('country_code');
    t.nonNull.int('customer_id');
    t.nonNull.string('email');
    t.nonNull.string('phone');
    t.nonNull.int('country_id');
    t.nonNull.string('first_name');
    t.nonNull.string('last_name');
    t.nonNull.string('position');
    t.nonNull.int('tenant_customer_id');
  }
});

export const addFavouriteKusInputType = inputObjectType({
  name: 'FavouriteKusInput',
  definition(t) {
    t.nonNull.string('account_number');
    t.nonNull.int('user_id');
    t.field('list_sku_id', {
      type: list('Int')
    });
  }
});
export const addPersonInputType = inputObjectType({
  name: 'PersonInput',
  definition(t) {
    t.nonNull.int('user_id');
    t.nonNull.int('id');
    t.nonNull.string('country_code');
    t.nonNull.int('customer_id');
    t.nonNull.string('email');
    t.nonNull.string('phone');
    t.nonNull.string('fax');
    t.nonNull.string('first_name');
    t.nonNull.string('last_name');
    t.nonNull.int('user_type_id');
    t.nonNull.string('position');
    t.nonNull.int('active');
  }
});
export const addUserInputType = inputObjectType({
  name: 'AddUserInput',
  definition(t) {
    t.nonNull.int('country_id');
    t.nonNull.int('customer_id');
    t.string('email');
    t.nonNull.string('mobile');
    t.nonNull.string('first_name');
    t.nonNull.string('last_name');
    t.nonNull.int('user_type_id');
    t.nonNull.int('buyer_type');
    t.nonNull.string('password');
  }
});
export const AddInvoicePaymentType = inputObjectType({
  name: 'AddInvoicePaymentInput',
  definition(t) {
    t.nonNull.int('invoice_id');
    t.nonNull.string('xero_account_id');
    t.nonNull.string('xero_payment_id');
    t.nonNull.string('xero_account_name');
    t.nonNull.decimal('amount');
    t.nonNull.int('user_id');
    t.nonNull.string('user_name');
    t.nonNull.string('reference_number');
    t.nonNull.string('log_description');
  }
});

export const ClosingTimeBySkuByIdInput = inputObjectType({
  name: 'closingTimeBySkuIdInput',
  definition(t) {
    t.nonNull.int('sku_id');
    t.nonNull.int('product_type_id');
    t.nonNull.string('date');
  }
});

export const CancelOrderRestockInput = inputObjectType({
  name: 'CancelOrderRestockInput',
  definition(t) {
    t.nonNull.int('orderItemId');
    t.nonNull.int('restockQty');
    t.nonNull.int('skuId');
    t.nonNull.int('customerSellerId');
    t.nonNull.int('productTypeId');
    t.nonNull.int('totalQty');
    t.nonNull.int('active');
  }
});

export const GroupBuyCheckoutInputCardItem = inputObjectType({
  name: 'GroupBuyCheckoutInputCardItem',
  definition(t) {
    t.nonNull.int('skuId');
    t.nonNull.int('quantity');
  }
});

export const AddSupplierDashboardAdmin = inputObjectType({
  name: 'AddSupplierDashboardAdmin',
  definition(t) {
    t.int('id');
    t.int('tenant_id');
    t.string('name');
    t.string('alias_name');
    t.string('account_number');
    t.int('customer_type_id'); // Tenant
    t.int('collection_type_id');
    t.boolean('hub');
    t.string('profile');
    t.boolean('halal_products');
    t.boolean('cod');
    t.int('credit_term');
    t.int('payment_type');
    t.string('delivery_instruction');
    t.decimal('delivery_charge');
    t.decimal('minimum_order');
    t.boolean('active');
    t.string('xero_id');
    t.string('voucherify_id');
    //tenants
    t.string('registration_number');
    t.string('tax_registration_number');
    t.decimal('tax_rate');
    t.string('email');
    t.string('first_name');
    t.string('last_name');
    t.int('email_notification');
    t.int('tenant_level');
    t.int('default_credit_card_term');
    t.int('lead_days');
    t.decimal('commission_rate');
    t.string('logo');
    //new field for logo/image properties
    t.string('base64');
    t.string('imageType');
  }
});

export const InputSpreeUpdate = inputObjectType({
  name: 'InputSpreeUpdate',
  definition(t) {
    t.int('advocate_id');
    t.string('delivery_date');
    t.string('end_date');
    t.int('hub_id');
    t.string('start_date');
    t.int('tenant_id');
  }
});

export const CustomerTenantInput = inputObjectType({
  name: 'CustomerTenantInput',
  definition(t) {
    t.int('id');
    t.int('customer_id');
    t.int('tenant_id');
    t.boolean('active');
    t.string('xero_customer_id');
    t.string('name');
    t.string('tenant_name');
    t.string('alias_name');
    t.boolean('cod');
    t.int('credit_term');
    t.int('payment_type');
    t.string('delivery_instruction');
    t.decimal('delivery_charge');
    t.decimal('minimum_order');
    t.decimal('commission_rate');
    t.boolean('auto_create_spree');
  }
});

export const AddCustomerInput = inputObjectType({
  name: 'AddCustomerInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('alias_name');
    t.nonNull.string('profile');
    t.boolean('halal_products');
    t.boolean('beef_products');
    t.boolean('cod');
    t.nonNull.int('credit_term');
    t.nonNull.int('payment_type');
    t.string('delivery_instruction');
    t.float('delivery_charge');
    t.float('minimum_order');
    t.boolean('hub');
    t.boolean('active');
    t.string('direction');
    t.float('hub_delivery_fee');
    t.boolean('hub_can_delivery');
    t.string('whatsapp_link');
    // t.boolean('is_private'); // not available yet
    // t.string('password'); // not available yet
    t.nonNull.int('tenant_id');
  }
});

export const UpdateCustomerInput = inputObjectType({
  name: 'UpdateCustomerInput',
  definition(t) {
    t.nonNull.int('id');
    t.string('name');
    t.string('alias_name');
    t.string('profile');
    t.boolean('halal_products');
    t.boolean('beef_products');
    t.boolean('cod');
    t.int('credit_term');
    t.int('payment_type');
    t.string('delivery_instruction');
    t.float('delivery_charge');
    t.float('minimum_order');
    t.boolean('hub');
    t.boolean('active');
    t.string('direction');
    t.float('hub_delivery_fee');
    t.boolean('hub_can_delivery');
    t.string('whatsapp_link');
    t.nonNull.int('tenant_id');
  }
});

export const CustomerAddressInput = inputObjectType({
  name: 'CustomerAddressInput',
  definition(t) {
    t.int('id');
    t.int('customer_id');
    t.string('floor_number');
    t.string('street_number');
    t.string('road');
    t.string('building');
    t.string('unit');
    t.string('stall');
    t.string('city');
    t.string('state');
    t.string('postal_code');
    t.field('latlng', { type: 'JSON' });
    t.int('country_id');
    t.int('address_type_id');
    t.field('address_type', {
      type: 'AddressTypeInput'
    });
    t.field('country', {
      type: 'countryInput'
    });
    t.boolean('active');
    t.boolean('is_default');
    t.int('created_by');
    t.int('updated_by');
  }
});

export const AddressTypeInput = inputObjectType({
  name: 'AddressTypeInput',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('description');
    t.boolean('active');
  }
});

export const countryInput = inputObjectType({
  name: 'countryInput',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('description');
    t.boolean('active');
    t.string('currency_code');
    t.string('currency_symbol');
    t.boolean('active');
  }
});

export const HourInput = inputObjectType({
  name: 'HourInput',
  definition(t) {
    t.string('hour_data');
  }
});
