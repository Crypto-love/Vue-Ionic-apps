import { Customer, TenantsIntegrationXero } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyAdminUser } from './__testData';
import xeroApi from '@treedots/xero';

const context = createTestContext(dummyAdminUser);

const dummyTenantsIntegrationXero = {
  xero_tenant_id: 'f462274f-a4ae-4425-8e9f-3df4dcac44cd'
} as TenantsIntegrationXero;

const lastAccountNumber = 'B1000';
const nextAccountNumber = 'B1001';
const xeroContactId = '3f5f01e3-ce1b-4e1e-b553-56f27aafebfa';
const payloadCustomer = {
  name: 'My Company',
  alias_name: 'my_company',
  profile: 'Other',
  halal_products: false,
  beef_products: false,
  cod: true,
  credit_term: 30,
  payment_type: 0,
  delivery_instruction: null,
  delivery_charge: 0.0,
  minimum_order: 0.0,
  hub: false,
  active: true,
  direction: null,
  hub_delivery_fee: 0,
  hub_can_delivery: false,
  whatsapp_link: null,
  tenant_id: 1
};

async function addCustomer(customer: any, is_parent: boolean) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `
      mutation addCustomer($customer: AddCustomerInput!, $is_parent: Boolean!) {
        addCustomer(customer: $customer, is_parent: $is_parent) {
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
          tenant_id
        }
      }
    `,
      {
        customer,
        is_parent
      }
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can add new customer', async () => {
    const xeroCustomerId = process.env.NODE_ENV !== 'development' ? xeroContactId : null;
    const dummyCustomer = {
      ...payloadCustomer,
      id: 1807,
      account_number: nextAccountNumber,
      customer_type_id: 2,
      xero_id: xeroCustomerId,
      tenant_id: null
    };
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);
    context.prisma.customer.findFirst.mockResolvedValueOnce({
      account_number: lastAccountNumber
    } as Customer);
    context.prisma.customer.create.mockResolvedValueOnce((dummyCustomer as any) as Customer);
    xeroApi.fetch = jest.fn().mockReturnValue({
      contacts: [
        {
          contactID: xeroCustomerId
        }
      ]
    });

    const result = await addCustomer(payloadCustomer, true);

    expect(result).toMatchObject({
      addCustomer: dummyCustomer
    });
  });

  it("user can't add new customer because of there is an error from Xero", async () => {
    const errorMessage =
      'The contact name Demo Company is already assigned to another contact. The contact name must be unique across all active contacts.';
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);
    context.prisma.customer.findFirst.mockResolvedValueOnce({
      account_number: lastAccountNumber
    } as Customer);
    xeroApi.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));

    const result = await addCustomer(payloadCustomer, true);

    expect(result).toMatchObject({
      data: {
        addCustomer: null
      },
      errors: [
        {
          message: errorMessage
        }
      ]
    });
  });
});
