import {
  Customer,
  CustomerTenant,
  Invoice,
  Order,
  OrderItem,
  Sku,
  TenantsIntegrationXero
} from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyAdminUser } from './__testData';
import xeroApi from '@treedots/xero';

const context = createTestContext(dummyAdminUser);

const dummyTenantsIntegrationXero = {
  xero_tenant_id: 'f462274f-a4ae-4425-8e9f-3df4dcac44cd'
} as TenantsIntegrationXero;

const dummyInvoices = [
  {
    id: 1001,
    invoice_id: null,
    invoice_number: 'INV-210121',
    code: '210819201807100',
    actual_delivery_date: new Date('2021-08-19'),
    due_date: new Date('2021-08-24')
  },
  {
    id: 1002,
    invoice_id: '2',
    invoice_number: 'INV-210122',
    code: '210823201807100',
    actual_delivery_date: new Date('2021-08-23'),
    due_date: new Date('2021-09-02')
  },
  {
    id: 1003,
    invoice_id: null,
    invoice_number: 'INV-210123',
    code: '210824101807167',
    actual_delivery_date: new Date('2021-08-24'),
    due_date: new Date('2021-08-31')
  }
];

const dummyGroupedOrderItems = ([
  [
    {
      sku_id: 1007,
      customer_buyer_id: 1807,
      customer_seller_id: 10,
      order_item_status_id: 2,
      driver_delivery_user_id: null,
      group_id: 2,
      sale_unit_price: 100.2339,
      sum: {
        total_price: 100.23,
        total_qty: 1,
        tax: 8.52
      }
    },
    {
      sku_id: 1244,
      customer_buyer_id: 1807,
      customer_seller_id: 10,
      order_item_status_id: 2,
      driver_delivery_user_id: null,
      group_id: 2,
      sale_unit_price: 340.8888,
      sum: {
        total_price: 340.89,
        total_qty: 1,
        tax: 23.86
      }
    },
    {
      sku_id: 1943,
      customer_buyer_id: 1807,
      customer_seller_id: 8,
      order_item_status_id: 2,
      driver_delivery_user_id: null,
      group_id: 2,
      sale_unit_price: 44.913,
      sum: {
        total_price: 44.91,
        total_qty: 1,
        tax: 3.14
      }
    }
  ],
  [
    {
      sku_id: 1007,
      customer_buyer_id: 1807,
      customer_seller_id: 10,
      order_item_status_id: 2,
      driver_delivery_user_id: null,
      group_id: 2,
      sale_unit_price: 100.2339,
      sum: {
        total_price: 200.46,
        total_qty: 2,
        tax: 17.04
      }
    }
  ],
  [
    {
      sku_id: 1052,
      customer_buyer_id: 1807,
      customer_seller_id: 7,
      order_item_status_id: 2,
      driver_delivery_user_id: null,
      group_id: 1,
      sale_unit_price: '2.1555',
      sum: {
        total_price: '2.16',
        total_qty: 1,
        tax: '0.15'
      }
    }
  ]
] as any) as Array<Array<OrderItem>>;

const dummyCustomers = ([
  [
    {
      id: 8,
      name: 'Quality Meat Pte Ltd',
      account_number: '1026',
      customer_type_id: 1
    },
    {
      id: 10,
      name: 'Eastern Harvest Foods (Singapore) Pte Ltd',
      account_number: '1023',
      customer_type_id: 1
    },
    {
      id: 1807,
      name: 'Demo Company',
      account_number: 'B0000',
      customer_type_id: 2
    }
  ],
  [
    {
      id: 10,
      name: 'Eastern Harvest Foods (Singapore) Pte Ltd',
      account_number: '1023',
      customer_type_id: 1
    },
    {
      id: 1807,
      name: 'Demo Company',
      account_number: 'B0000',
      customer_type_id: 2
    }
  ],
  [
    {
      id: 7,
      name: 'Lee Say Poultry Farm Pte Ltd',
      account_number: '1028',
      customer_type_id: 1
    },
    {
      id: 1807,
      name: 'Demo Company',
      account_number: 'B0000',
      customer_type_id: 2
    }
  ]
] as any) as Array<Customer[]>;

const dummySkus = ([
  [
    {
      id: 1007,
      name: 'Frozen Batang Steak 吧当鱼 (5 X 2 KG)',
      product: {
        tenant_id: 1
      }
    },
    {
      id: 1244,
      name: 'Frozen Arrowtooth Flounder Fillet 320g (10 KG)',
      product: {
        tenant_id: 1
      }
    },
    {
      id: 1943,
      name: 'Frozen Chicken Whole Leg 220-240g Pilgrim Pride (13.61 KG)',
      product: {
        tenant_id: 1
      }
    }
  ],
  [
    {
      id: 1007,
      name: 'Frozen Batang Steak 吧当鱼 (5 X 2 KG)',
      product: {
        tenant_id: 1
      }
    }
  ],
  [
    {
      id: 1052,
      name: 'Fresh Chicken Bone (5 KG)',
      product: {
        tenant_id: 1
      }
    }
  ]
] as any) as Array<Sku[]>;

const dummyOrders = ([
  [
    { id: 51363, po_number: '123' },
    { id: 51364, po_number: null }
  ],
  [
    { id: 51365, po_number: null },
    { id: 51366, po_number: null }
  ],
  [{ id: 51367, po_number: null }]
] as any) as Array<Order[]>;

const dummyCustomerTenant = ({
  id: 1,
  xero_customer_id: '3f5f01e3-ce1b-4e1e-b553-56f27aafebfa',
  credit_term: 7
} as any) as CustomerTenant;

async function uploadInvoicesToXero(tenant_id: number, invoice_ids: number[]) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `
      mutation ($tenant_id: Int!, $invoice_ids: [Int]!){
        uploadInvoicesToXero(tenant_id: $tenant_id, invoice_ids: $invoice_ids) {
          success
          fail
        }
      }
    `,
      {
        tenant_id,
        invoice_ids
      }
    );
  } catch (error) {
    return error.response || error;
  }
}

function getInvoiceNumber(invoiceNumber: string) {
  switch (process.env.NODE_ENV) {
    case 'development':
      return `${invoiceNumber}-DEV`;
    case 'testing':
      return `${invoiceNumber}-TESTING`;
    case 'staging':
      return `${invoiceNumber}-STAGING`;
    default:
      return invoiceNumber;
  }
}

describe('ensure that', () => {
  it('user create and/or update xero invoices', async () => {
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);

    const invoiceToCreate = [];
    const invoiceToUpdate = [];
    for (let i = 0; i < dummyInvoices.length; i++) {
      context.prisma.invoice.findUnique.mockResolvedValueOnce(dummyInvoices[i] as Invoice);
      context.prisma.orderItem.groupBy.mockResolvedValueOnce(dummyGroupedOrderItems[i]);
      context.prisma.customer.findMany.mockResolvedValueOnce(dummyCustomers[i]);
      context.prisma.sku.findMany.mockResolvedValueOnce(dummySkus[i]);
      context.prisma.order.findMany.mockResolvedValueOnce(dummyOrders[i]);
      context.prisma.customerTenant.findFirst.mockResolvedValueOnce(dummyCustomerTenant);

      if (dummyInvoices[i].invoice_id) invoiceToUpdate.push(dummyInvoices[i]);
      else invoiceToCreate.push(dummyInvoices[i]);
    }

    xeroApi.fetch = jest.fn();

    /* Mock invoice creation first */
    if (invoiceToCreate.length) {
      xeroApi.fetch.mockReturnValueOnce({
        invoices: invoiceToCreate.map((v) => {
          return {
            invoiceID: `FOO_BAR_XERO_INVOICE_${v.id}`,
            invoiceNumber: getInvoiceNumber(v.invoice_number)
          };
        })
      });
    }

    /* Mock invoice update */
    invoiceToUpdate.forEach((v) => {
      xeroApi.fetch.mockReturnValueOnce({
        invoices: [
          {
            invoiceID: `FOO_BAR_XERO_INVOICE_${v.id}`,
            invoiceNumber: getInvoiceNumber(v.invoice_number)
          }
        ]
      });
    });

    const result = await uploadInvoicesToXero(
      1,
      dummyInvoices.map((v) => v.id)
    );

    expect(result).toMatchObject({
      uploadInvoicesToXero: {
        success: [
          ...invoiceToCreate.map((v) => getInvoiceNumber(v.invoice_number)),
          ...invoiceToUpdate.map((v) => getInvoiceNumber(v.invoice_number))
        ],
        fail: []
      }
    });
  });

  it('user create and/or update only several xero invoices', async () => {
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);

    const failInvoiceids = [1001, 1002];
    const invoiceToCreate = [];
    const invoiceToUpdate = [];
    for (let i = 0; i < dummyInvoices.length; i++) {
      context.prisma.invoice.findUnique.mockResolvedValueOnce(dummyInvoices[i] as Invoice);
      context.prisma.orderItem.groupBy.mockResolvedValueOnce(dummyGroupedOrderItems[i]);
      context.prisma.customer.findMany.mockResolvedValueOnce(dummyCustomers[i]);
      context.prisma.sku.findMany.mockResolvedValueOnce(dummySkus[i]);
      context.prisma.order.findMany.mockResolvedValueOnce(dummyOrders[i]);
      context.prisma.customerTenant.findFirst.mockResolvedValueOnce(dummyCustomerTenant);

      // Set invoice_id so it will trigger update invoice
      if (dummyInvoices[i].id === 1001) dummyInvoices[i].invoice_id = `${dummyInvoices[i].id}`;

      if (dummyInvoices[i].invoice_id) invoiceToUpdate.push(dummyInvoices[i]);
      else invoiceToCreate.push(dummyInvoices[i]);
    }

    xeroApi.fetch = jest.fn();
    const errorMessage = 'The line total 1.00 does not match the expected line total 100.00';

    /* Mock invoice creation first */
    if (invoiceToCreate.length) {
      xeroApi.fetch.mockReturnValueOnce({
        invoices: invoiceToCreate.map((v) => {
          return {
            invoiceID: `FOO_BAR_XERO_INVOICE_${v.id}`,
            invoiceNumber: getInvoiceNumber(v.invoice_number),
            hasErrors: failInvoiceids.includes(v.id),
            validationErrors: failInvoiceids.includes(v.id)
              ? [
                  {
                    message: errorMessage
                  }
                ]
              : undefined
          };
        })
      });
    }

    /* Mock invoice update */
    invoiceToUpdate.forEach((v) => {
      if (failInvoiceids.includes(v.id)) {
        xeroApi.fetch.mockRejectedValueOnce(new Error(errorMessage));
      } else {
        xeroApi.fetch.mockReturnValueOnce({
          invoices: [
            {
              invoiceID: `FOO_BAR_XERO_INVOICE_${v.id}`,
              getInvoiceNumber(invoiceNumber: v.invoice_number);
            }
          ]
        });
      }
    });

    const result = await uploadInvoicesToXero(
      1,
      dummyInvoices.map((v) => v.id)
    );

    expect(result).toMatchObject({
      uploadInvoicesToXero: {
        success: [
          ...invoiceToCreate
            .filter((v) => !failInvoiceids.includes(v.id))
            .map((v) => getInvoiceNumber(v.invoice_number)),
          ...invoiceToUpdate
            .filter((v) => !failInvoiceids.includes(v.id))
            .map((v) => getInvoiceNumber(v.invoice_number))
        ],
        fail: [
          ...invoiceToCreate
            .filter((v) => failInvoiceids.includes(v.id))
            .map((v) => `${getInvoiceNumber(v.invoice_number)}, ${errorMessage}`),
          ...invoiceToUpdate
            .filter((v) => failInvoiceids.includes(v.id))
            .map((v) => `${getInvoiceNumber(v.invoice_number)}, ${errorMessage}`)
        ]
      }
    });
  });

  it("user can't upload invoice because customer doesn't have xero customer id", async () => {
    context.prisma.tenantsIntegrationXero.findFirst.mockResolvedValueOnce(dummyTenantsIntegrationXero);

    const a = [...dummyInvoices];
    for (let i = 0; i < a.length; i++) {
      context.prisma.invoice.findUnique.mockResolvedValueOnce(dummyInvoices[i] as Invoice);
      context.prisma.orderItem.groupBy.mockResolvedValueOnce(dummyGroupedOrderItems[i]);
      context.prisma.customer.findMany.mockResolvedValueOnce(dummyCustomers[i]);
      context.prisma.sku.findMany.mockResolvedValueOnce(dummySkus[i]);
      context.prisma.order.findMany.mockResolvedValueOnce(dummyOrders[i]);
      context.prisma.customerTenant.findFirst.mockResolvedValueOnce({
        id: 1,
        xero_customer_id: null
      } as CustomerTenant);
    }

    const customer = dummyCustomers[0].find((v) => v.customer_type_id === 2);

    const result = await uploadInvoicesToXero(
      1,
      dummyInvoices.map((v) => v.id)
    );

    expect(result).toMatchObject({
      data: {
        uploadInvoicesToXero: null
      },
      errors: [
        {
          message: `${customer.name} has invalid Xero Customer ID`
        }
      ]
    });
  });

  it("user can't upload invoice because of tenant is not integrated yet to xero", async () => {
    const result = await uploadInvoicesToXero(
      1,
      dummyInvoices.map((v) => v.id)
    );

    expect(result).toMatchObject({
      data: {
        uploadInvoicesToXero: null
      },
      errors: [
        {
          message: 'Tenant not integrated with Xero'
        }
      ]
    });
  });
});
