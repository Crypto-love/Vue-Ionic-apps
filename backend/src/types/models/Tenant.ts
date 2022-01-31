import { objectType } from 'nexus';

export const Tenant = objectType({
  name: 'Tenant',
  definition(t) {
    t.model.id();
    t.model.merchant_id();
    t.model.registration_number();
    t.model.tax_registration_number();
    t.decimal('tax_rate');
    t.model.building_name();
    t.model.street_name();
    t.model.unit_number();
    t.model.email();
    t.model.first_name();
    t.model.last_name();
    t.model.email_notification();
    t.model.class_id();
    t.model.default_credit_card_term();
    t.model.xeroIntegration();
    t.model.logo();
    t.model.lead_days();
    t.model.commission_rate();
    t.field('tenant_class', {
      type: 'TenantClass',
      resolve: (parent, _, context) => {
        return context.prisma.tenantClass.findFirst({
          where: { id: parent.class_id }
        });
      }
    });
    t.field('tenant', {
      type: 'Customer',
      resolve: (parent, _, context) => {
        return context.prisma.customer.findFirst({
          where: { tenant_id: parent.id, customer_type_id: 3 }
        });
      }
    });
    t.field('key_person', {
      type: 'Person',
      resolve: (parent, _, context) => {
        return context.prisma.person.findFirst({
          where: { position: 'Key Contact', id: parent.id }
        });
      }
    });
    t.model.customer();
    t.model.direct_price();
    t.model.automatic_connection_approval();
    t.model.discoverable();
    t.model.send_statement_on_regular_basis();
    t.model.paynow();
    t.model.interbank_fund_transfer();
    t.model.cheque();
    t.model.cash_on_delivery();
    t.model.offer_credit_term_at_app_checkout();
    t.model.offer_credit_term_type_id();
  }
});

export const TenantsHoliday = objectType({
  name: 'TenantsHoliday',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.start_date();
    t.model.end_date();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.description();
    t.model.active();
  }
});

export const TenantsIntegrationMenuSlack = objectType({
  name: 'TenantsIntegrationMenuSlack',
  definition(t) {
    t.model.id();
    t.model.menu_name();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationMenuTookan = objectType({
  name: 'TenantsIntegrationMenuTookan',
  definition(t) {
    t.model.id();
    t.model.menu_name();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationMenuXero = objectType({
  name: 'TenantsIntegrationMenuXero',
  definition(t) {
    t.model.id();
    t.model.menu_name();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationSlack = objectType({
  name: 'TenantsIntegrationSlack',
  definition(t) {
    t.model.id();
    t.model.tenant_id();
    t.model.host();
    t.model.channels();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationStorecove = objectType({
  name: 'TenantsIntegrationStorecove',
  definition(t) {
    t.model.id();
    t.model.tenant_id();
    t.model.legal_entity_id();
    t.model.peppol_id();
    t.model.peppol_scheme_id();
    t.model.send_only();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationStripe = objectType({
  name: 'TenantsIntegrationStripe',
  definition(t) {
    t.model.id();
    t.model.tenant_id();
    t.model.host();
    t.model.public_key();
    t.model.secret_key();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationTookan = objectType({
  name: 'TenantsIntegrationTookan',
  definition(t) {
    t.model.id();
    t.model.tenant_id();
    t.model.host();
    t.model.api_key();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
  }
});

export const TenantsIntegrationXero = objectType({
  name: 'TenantsIntegrationXero',
  definition(t) {
    t.model.id();
    t.model.tenant_id();
    t.model.xero_tenant_id();
    t.model.xero_token_set();
    t.model.created_at();
    t.model.created_by();
    t.model.updated_at();
    t.model.updated_by();
    t.model.active();
    t.model.tenant();
  }
});

export const TenantClass = objectType({
  name: 'TenantClass',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.model.active();
  }
});

export const SupplierState = objectType({
  name: 'SupplierState',
  definition(t) {
    t.model.supplier();
    t.model.supplier_id();
    t.model.state();
    t.model.state_id();
    t.model.active();
  }
});

export const SupplierStatePagination = objectType({
  name: 'SupplierStatePagination',
  definition(t) {
    t.list.field('all_supplier_states', { type: 'SupplierState' });
    t.int('total_rows');
    t.int('total_pages');
  }
});

export const SupplierStatementOfAccountSetting = objectType({
  name: 'SupplierStatementOfAccountSetting',
  definition(t) {
    t.model.id();
    t.model.supplier_id();
    t.model.statement_type_id();
    t.model.frequency_type_id();
    t.model.value();
    t.model.supplier();
    t.model.statement_type();
    t.model.frequency_type();
  }
});

export const SupplierStatementType = objectType({
  name: 'SupplierStatementType',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.descriptions();
  }
});

export const SupplierFrequencyType = objectType({
  name: 'SupplierFrequencyType',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.descriptions();
    t.model.field_name();
    t.model.active();
  }
});

export const SupplierPaymentMethodOption = objectType({
  name: 'SupplierPaymentMethodOption',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.descriptions();
    t.model.active();
    t.model.supplier_payment_method();
  }
});

export const SupplierPaymentMethod = objectType({
  name: 'SupplierPaymentMethod',
  definition(t) {
    t.model.id();
    t.model.supplier_id();
    t.model.supplier_payment_method_detail();
    t.model.supplier_payment_method_option();
  }
});

export const SupplierPaymentMethodDetail = objectType({
  name: 'SupplierPaymentMethodDetail',
  definition(t) {
    t.model.id();
    t.model.uen_number();
    t.model.phone_number();
    t.model.company_name();
    t.model.bank_id();
    t.model.account_name();
    t.model.account_number();
    t.model.active();
    t.model.supplier_payment_method();
    t.model.bank();
  }
});
