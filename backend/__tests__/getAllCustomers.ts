import { Customer } from '@prisma/client';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const ctx = createTestContext(userInfo);

const dummyCustomer = ([
  {
    id: 1440,
    name: '251 Jurong East Street 24 B2C',
    alias_name: 'Jurong East',
    account_number: 'B1146',
    group_id: null,
    customer_type_id: 2,
    collection_type_id: null,
    profile: 'Other',
    halal_products: true,
    beef_products: false,
    cod: false,
    credit_term: 0,
    payment_type: 1,
    delivery_instruction: null,
    delivery_charge: 10,
    minimum_order: 10,
    hub: true,
    xero_id: 'c413b66c-2d34-48c2-b7bf-d169777a05b1',
    voucherify_id: null,
    direction: null,
    hub_delivery_fee: null,
    hub_can_delivery: false,
    whatsapp_link: null,
    storecove_id: null,
    active: true,
    tenant_id: 1,
    tenant: null
  },
  {
    id: 3250,
    name: 'EG Fishery Pte Ltd',
    alias_name: 'EG 2020',
    account_number: null,
    group_id: null,
    customer_type_id: 3,
    collection_type_id: null,
    profile: 'Other',
    halal_products: false,
    beef_products: false,
    cod: false,
    credit_term: 0,
    payment_type: null,
    delivery_instruction: null,
    delivery_charge: null,
    minimum_order: 300,
    hub: false,
    xero_id: null,
    voucherify_id: null,
    direction: null,
    hub_delivery_fee: null,
    hub_can_delivery: false,
    whatsapp_link: null,
    storecove_id: null,
    active: true,
    tenant_id: 14,
    tenant: {
      commission_rate: 3.1
    }
  }
] as unknown) as Customer[];
const dummyUserCustomer = ([
  {
    customer_id: 1
  }
] as unknown) as userCustomer;
async function getAllCustomers(tenantId, hubId, active, customer_type_id) {
  try {
    if (tenantId) tenantId = `tenantId: ${tenantId}`;
    else tenantId = '';
    if (hubId) hubId = `hubId: ${hubId}`;
    else hubId = '';
    if (active) active = `active: ${active}`;
    else active = '';
    if (customer_type_id) customer_type_id = `customer_type_id: ${customer_type_id}`;
    else customer_type_id = '';
    const requestQuery = `
    query {
      getAllCustomers(${tenantId}
        ${tenantId ? ',' + hubId : hubId}
        ${hubId ? ',' + customer_type_id : customer_type_id}
        ${customer_type_id ? ',' + active : active}) {
        id
        name
        alias_name
        account_number
        group_id
        customer_type_id
        collection_type_id
        profile
        halal_products
        beef_products
        cod
        credit_term
        payment_type
        delivery_instruction
        delivery_charge
        minimum_order
        hub
        xero_id
        voucherify_id
        direction
        hub_delivery_fee
        hub_can_delivery
        whatsapp_link
        storecove_id
        active
        tenant_id
        tenant {
          commission_rate
        }
      }
    }
  `;
    return await ctx.client.setHeader('Authorization', ctx.token).request(requestQuery);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('can get all customer data', async () => {
    //mock dummy data to customer table
    const filterDummy = dummyCustomer.filter((x) => x.customer_type_id === 2);
    ctx.prisma.userCustomer.findMany.mockResolvedValueOnce(dummyUserCustomer);
    ctx.prisma.customer.findMany.mockResolvedValueOnce(filterDummy);
    const result = await getAllCustomers(null, 1440, null, 2);
    expect(result).toMatchObject({
      getAllCustomers: [
        {
          account_number: expect.any(String),
          active: expect.any(Boolean),
          alias_name: expect.any(String),
          beef_products: expect.any(Boolean),
          cod: expect.any(Boolean),
          collection_type_id: null,
          credit_term: expect.any(Number),
          customer_type_id: expect.any(Number),
          delivery_charge: expect.any(Number),
          delivery_instruction: null,
          direction: null,
          group_id: null,
          halal_products: expect.any(Boolean),
          hub: expect.any(Boolean),
          hub_can_delivery: expect.any(Boolean),
          hub_delivery_fee: null,
          id: expect.any(Number),
          minimum_order: expect.any(Number),
          name: expect.any(String),
          payment_type: expect.any(Number),
          profile: expect.any(String),
          storecove_id: null,
          tenant: null,
          tenant_id: expect.any(Number),
          voucherify_id: null,
          whatsapp_link: null,
          xero_id: expect.any(String)
        }
      ]
    });
  });
  it('can get all tenant on customer data', async () => {
    //mock dummy data to customer table
    const filterDummy = dummyCustomer.filter((x) => x.customer_type_id === 3);
    ctx.prisma.userCustomer.findMany.mockResolvedValueOnce(dummyUserCustomer);
    ctx.prisma.customer.findMany.mockResolvedValueOnce(filterDummy);
    const result = await getAllCustomers(14, null, null, 3);
    expect(result).toMatchObject({
      getAllCustomers: [
        {
          account_number: null,
          active: expect.any(Boolean),
          alias_name: expect.any(String),
          beef_products: expect.any(Boolean),
          cod: expect.any(Boolean),
          collection_type_id: null,
          credit_term: expect.any(Number),
          customer_type_id: expect.any(Number),
          delivery_charge: null,
          delivery_instruction: null,
          direction: null,
          group_id: null,
          halal_products: expect.any(Boolean),
          hub: expect.any(Boolean),
          hub_can_delivery: expect.any(Boolean),
          hub_delivery_fee: null,
          id: expect.any(Number),
          minimum_order: expect.any(Number),
          name: expect.any(String),
          payment_type: null,
          profile: expect.any(String),
          storecove_id: null,
          tenant: null,
          tenant_id: expect.any(Number),
          voucherify_id: null,
          whatsapp_link: null,
          xero_id: null
        }
      ]
    });
  });
  it('cant get all customer active data', async () => {
    //mock dummy data to customer table
    const filterDummy = dummyCustomer.filter((x) => x.customer_type_id === 2);
    ctx.prisma.userCustomer.findMany.mockResolvedValueOnce(dummyUserCustomer);
    ctx.prisma.customer.findMany.mockResolvedValueOnce(filterDummy);
    const result = await getAllCustomers(null, null, true, 2);
    expect(result).toMatchObject({
      getAllCustomers: [
        {
          account_number: expect.any(String),
          active: expect.any(Boolean),
          alias_name: expect.any(String),
          beef_products: expect.any(Boolean),
          cod: expect.any(Boolean),
          collection_type_id: null,
          credit_term: expect.any(Number),
          customer_type_id: expect.any(Number),
          delivery_charge: expect.any(Number),
          delivery_instruction: null,
          direction: null,
          group_id: null,
          halal_products: expect.any(Boolean),
          hub: expect.any(Boolean),
          hub_can_delivery: expect.any(Boolean),
          hub_delivery_fee: null,
          id: expect.any(Number),
          minimum_order: expect.any(Number),
          name: expect.any(String),
          payment_type: expect.any(Number),
          profile: expect.any(String),
          storecove_id: null,
          tenant: null,
          tenant_id: expect.any(Number),
          voucherify_id: null,
          whatsapp_link: null,
          xero_id: expect.any(String)
        }
      ]
    });
  });
  it('cant get all tenant active data', async () => {
    //mock dummy data to customer table
    const filterDummy = dummyCustomer.filter((x) => x.customer_type_id === 3);
    ctx.prisma.userCustomer.findMany.mockResolvedValueOnce(dummyUserCustomer);
    ctx.prisma.customer.findMany.mockResolvedValueOnce(filterDummy);
    const result = await getAllCustomers(null, null, true, 3);
    expect(result).toMatchObject({
      getAllCustomers: [
        {
          account_number: null,
          active: expect.any(Boolean),
          alias_name: expect.any(String),
          beef_products: expect.any(Boolean),
          cod: expect.any(Boolean),
          collection_type_id: null,
          credit_term: expect.any(Number),
          customer_type_id: expect.any(Number),
          delivery_charge: null,
          delivery_instruction: null,
          direction: null,
          group_id: null,
          halal_products: expect.any(Boolean),
          hub: expect.any(Boolean),
          hub_can_delivery: expect.any(Boolean),
          hub_delivery_fee: null,
          id: expect.any(Number),
          minimum_order: expect.any(Number),
          name: expect.any(String),
          payment_type: null,
          profile: expect.any(String),
          storecove_id: null,
          tenant: null,
          tenant_id: expect.any(Number),
          voucherify_id: null,
          whatsapp_link: null,
          xero_id: null
        }
      ]
    });
  });
});
