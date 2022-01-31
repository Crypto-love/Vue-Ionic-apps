import { objectType } from 'nexus';

export const B2cDeliveryMethod = objectType({
  name: 'B2cDeliveryMethod',
  definition(t) {
    t.model.id();
    t.model.order_id();
    t.model.delivery_method();
    t.nonNull.float('delivery_fee');
  }
});

export const Branch = objectType({
  name: 'Branch',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.customer_branch_id();
    t.model.active();
  }
});

export const CollectionType = objectType({
  name: 'CollectionType',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.model.active();
  }
});

export const Customer = objectType({
  name: 'Customer',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.alias_name();
    t.model.account_number();
    t.model.group_id();
    t.model.customer_type_id();
    t.model.collection_type_id();
    t.model.profile();
    t.model.halal_products();
    t.model.beef_products();
    t.model.cod();
    t.model.credit_term();
    t.model.payment_type();
    t.model.delivery_instruction();
    t.decimal('delivery_charge');
    t.decimal('minimum_order');
    t.model.hub();
    t.model.xero_id();
    t.model.voucherify_id();
    t.model.direction();
    t.decimal('hub_delivery_fee');
    t.model.hub_can_delivery();
    t.model.whatsapp_link();
    t.model.storecove_id();
    t.model.active();
    t.model.peppol_scheme_id();
    t.model.tenant_id();
    t.field('hubSpreeData', {
      type: 'HubSpreeData',
      resolve: (parent, _, context) => {
        if (parent.customer_type_id == 2)
          return context.prisma.hubSpreeData.findFirst({
            where: {
              active: true,
              Status: 0,
              hub_id: parent.id
            }
          });

        return null;
      }
    });
    t.field('tenant', {
      type: 'Tenant',
      resolve: (parent, _, context) => {
        if (parent.customer_type_id == 3)
          return context.prisma.tenant.findFirst({
            where: { id: parent.tenant_id || undefined }
          });

        return null;
      }
    });
    // t.list.field('address', {
    //   type: 'Address',
    //   resolve: (parent, _, context) => {
    //     return context.prisma.address.findMany({
    //       where: { customer_id: parent.id, NOT: { address_type_id: 3 }, active: true }
    //     });
    //   }
    // });
    t.model.address();
    t.field('defaultAddress', {
      type: 'Address',
      resolve: (parent, _, context) => {
        return context.prisma.address.findFirst({
          where: { customer_id: parent.id, NOT: { address_type_id: 3 }, active: true },
          orderBy: [{ is_default: 'desc' }, { updated_by: 'desc' }]
        });
      }
    });
    t.model.CustomerTenant();
    t.model.DeliveryDay();
    t.model.persons();
    t.model.group();
    t.model.customer_type();
    t.model.hours();
    t.model.SupplierState();
    t.model.userCustomers();
  }
});

export const CustomerImage = objectType({
  name: 'CustomerImage',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.image();
    t.model.created_at();
    t.model.active();
  }
});

export const CustomerTenant = objectType({
  name: 'CustomerTenant',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.tenant_id();
    t.model.xero_customer_id();
    t.model.alias_name();
    t.model.cod();
    t.model.credit_term();
    t.model.payment_type();
    t.model.delivery_instruction();
    t.model.commission_rate();
    t.model.auto_create_spree();
    t.decimal('delivery_charge');
    t.decimal('minimum_order');
    t.model.active();
    t.list.field('hubSpreeData', {
      type: 'HubSpreeData',
      resolve: async (parent, _, context) => {
        return context.prisma.hubSpreeData.findMany({
          where: {
            active: true,
            Status: 0,
            tenant_id: parent.tenant_id,
            start_date: {
              lt: new Date().toISOString()
            },
            end_date: {
              gt: new Date().toISOString()
            }
          }
        });
      }
    });
    t.model.customer();
    t.model.tenant();
  }
});

export const CustomerTenantJoinRequest = objectType({
  name: 'CustomerTenantJoinRequest',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.tenant_id();
    t.model.created_by();
    t.model.created_at();
    t.model.updated_by();
    t.model.updated_at();
    t.model.approved();
    t.model.active();
  }
});

export const CustomerType = objectType({
  name: 'CustomerType',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.model.active();
  }
});

export const Group = objectType({
  name: 'Group',
  definition(t) {
    t.model.id();
    t.model.name();
    t.model.description();
    t.model.active();
  }
});

export const Person = objectType({
  name: 'Person',
  definition(t) {
    t.model.id();
    t.model.customer_id();
    t.model.first_name();
    t.model.last_name();
    t.model.email();
    t.model.phone();
    t.model.fax();
    t.model.position();
    t.model.is_default();
    t.model.active();
  }
});

export const CustomerServerPagination = objectType({
  name: 'CustomerServerPagination',
  definition(t) {
    t.list.field('Customer', { type: 'Customer' }), t.int('total_rows');
    t.int('total_page');
  }
});

export const CustomerTenantPagination = objectType({
  name: 'CustomerTenantPagination',
  definition(t) {
    t.list.field('supplier_list', { type: 'CustomerTenant' });
    t.int('total_page');
    t.int('total_rows');
  }
});
