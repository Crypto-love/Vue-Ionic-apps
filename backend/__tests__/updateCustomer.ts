import { Customer, CustomerTenant, TenantsIntegrationXero } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyAdminUser } from './__testData';
import xeroApi from '@treedots/xero';

const context = createTestContext(dummyAdminUser);

const dummyTenantsIntegrationXero = {
  xero_tenant_id: 'f462274f-a4ae-4425-8e9f-3df4dcac44cd'
} as TenantsIntegrationXero;

const xeroContactId = '3f5f01e3-ce1b-4e1e-b553-56f27aafebfa';
const customerName = 'Demo Company';

const dummyCustomerTenant = ({
  id: 1,
  xero_customer_id: xeroContactId
} as any) as CustomerTenant;

const payloadCustomer = {
  id: 1807,
  name: customerName,
  alias_name: 'demo company',
  profile: 'Other',
  halal_products: false,
  beef_products: false,
  cod: true,
  credit_term: 30,
  payment_type: 0,
  delivery_instruction: null,
  delivery_charge: 0.0,
  minimum_order: 0.0,
  hub: true,
  active: true,
  direction: null,
  hub_delivery_fee: 0,
  hub_can_delivery: false,
  whatsapp_link: null,
  tenant_id: 1
};

async function updateCustomer(customer: any) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `
      mutation updateCustomer($customer: UpdateCustomerInput!) {
        updateCustomer(customer: $customer) {
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
        customer
      }
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can update customer', async () => {
    const xeroCustomerId = process.env.NODE_ENV !== 'development' ? xeroContactId : null;
    const dummyCustomer = {
      ...payloadCustomer,
      id: 1807,
      account_number: 'B0000',
      customer_type_id: 2,
      xero_id: null,
      tenant_id: null
    };
    context.prisma.customerTenant.findFirst.mockResolvedValueOnce(dummyCustomerTenant);
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);
    context.prisma.customer.update.mockResolvedValueOnce((dummyCustomer as any) as Customer);
    xeroApi.fetch = jest.fn().mockReturnValue({
      contacts: [
        {
          contactID: xeroCustomerId
        }
      ]
    });

    const result = await updateCustomer(payloadCustomer);

    expect(result).toMatchObject({
      updateCustomer: dummyCustomer
    });
  });

  it("user can't update customer because of there is an error from Xero", async () => {
    const errorMessage = `"The contact name ${customerName} is already assigned to another contact. The contact name must be unique across all active contacts."`;
    context.prisma.customerTenant.findFirst.mockResolvedValueOnce(dummyCustomerTenant);
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);
    xeroApi.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));

    const result = await updateCustomer(payloadCustomer);

    expect(result).toMatchObject({
      data: {
        updateCustomer: null
      },
      errors: [
        {
          message: errorMessage
        }
      ]
    });
  });
});
