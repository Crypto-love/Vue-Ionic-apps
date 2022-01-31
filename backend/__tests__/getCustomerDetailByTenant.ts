import { Customer } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyAdminUser } from './__testData';

const context = createTestContext(dummyAdminUser);

const dummyCustomerTenants = [
  {
    id: 1,
    customer_id: 1807,
    tenant_id: 1,
    active: true,
    xero_customer_id: '3f5f01e3-ce1b-4e1e-b553-56f27aafebfa',
    alias_name: null,
    cod: true,
    credit_term: 7,
    payment_type: 0,
    delivery_instruction: 'Just demo',
    delivery_charge: 10,
    minimum_order: 0,
    commission_rate: null,
    auto_create_spree: false
  }
];

const dummyCustomer = ({
  id: 1807,
  name: 'Demo Company',
  alias_name: null,
  account_number: 'B0000',
  password: null,
  is_private: null,
  group_id: null,
  customer_type_id: 2,
  collection_type_id: 0,
  profile: 'Hotel',
  halal_products: true,
  beef_products: false,
  cod: false,
  credit_term: 0,
  payment_type: 1,
  delivery_instruction: null,
  delivery_charge: 10,
  minimum_order: 0,
  hub: false,
  active: true,
  xero_id: 'NULL',
  voucherify_id: null,
  direction: null,
  hub_delivery_fee: null,
  hub_can_delivery: false,
  whatsapp_link: null,
  storecove_id: null,
  peppol_id: 'FOO_BAR',
  tenant_id: null,
  peppol_scheme_id: 1,
  CustomerTenant: dummyCustomerTenants
} as any) as Customer;

async function getCustomerDetailByTenant(customer_id: number, tenant_id: number) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getCustomerDetailByTenant (customer_id: ${customer_id}, tenant_id: ${tenant_id}) {
          id
          name
          alias_name
          account_number
          profile
          customer_type_id
          halal_products
          beef_products
          cod
          credit_term
          payment_type
          delivery_instruction
          delivery_charge
          minimum_order
          hub
          active
          direction
          hub_delivery_fee
          hub_can_delivery
          whatsapp_link
          active
          xero_id
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can get customer detail', async () => {
    context.prisma.customer.findUnique.mockResolvedValueOnce(dummyCustomer);

    const result = await getCustomerDetailByTenant(1807, 1);

    expect(result).toMatchObject({
      getCustomerDetailByTenant: {
        id: dummyCustomer.id,
        name: dummyCustomer.name,
        alias_name: dummyCustomer.alias_name,
        account_number: dummyCustomer.account_number,
        profile: dummyCustomer.profile,
        customer_type_id: dummyCustomer.customer_type_id,
        halal_products: dummyCustomer.halal_products,
        beef_products: dummyCustomer.beef_products,
        hub: dummyCustomer.hub,
        active: dummyCustomer.active,
        direction: dummyCustomer.direction,
        hub_delivery_fee: dummyCustomer.hub_delivery_fee,
        hub_can_delivery: dummyCustomer.hub_can_delivery,
        whatsapp_link: dummyCustomer.whatsapp_link,

        cod: dummyCustomerTenants[0].cod,
        credit_term: dummyCustomerTenants[0].credit_term,
        payment_type: dummyCustomerTenants[0].payment_type,
        delivery_instruction: dummyCustomerTenants[0].delivery_instruction,
        delivery_charge: dummyCustomerTenants[0].delivery_charge,
        minimum_order: dummyCustomerTenants[0].minimum_order,
        xero_id: dummyCustomerTenants[0].xero_customer_id
      }
    });
  });
});
