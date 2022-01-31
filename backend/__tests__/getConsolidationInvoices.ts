import { Customer, Invoice, OrderItem } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyAdminUser } from './__testData';
import dayjs from 'dayjs';

const context = createTestContext(dummyAdminUser);

const dummyOrderItems = ([
  { invoice_id: 47964, customer_buyer_id: 681 },
  { invoice_id: 47965, customer_buyer_id: 1807 },
  { invoice_id: 47966, customer_buyer_id: 1807 },
  { invoice_id: 47967, customer_buyer_id: 1807 }
] as any) as OrderItem[];

const dummyCustomers = ([
  { id: 681, name: 'Demo Company 2' },
  { id: 1807, name: 'Demo Company' }
] as any) as Customer[];

const deliveryDate = new Date();

const dummyInvoices = ([
  {
    id: 47967,
    invoice_id: '07ae5fea-5a24-44bf-9655-2ef0e19e61fe',
    invoice_number: 'INV-210138',
    actual_delivery_date: deliveryDate,
    amount: 22.15
  },
  {
    id: 47966,
    invoice_id: '89399f4c-0f09-4c42-ba3e-c05f593e8145',
    invoice_number: 'INV-210137',
    actual_delivery_date: deliveryDate,
    amount: 10.62
  },
  {
    id: 47965,
    invoice_id: '383bc585-bdc5-4e14-bf74-ce0b52c40a8d',
    invoice_number: 'INV-210136',
    actual_delivery_date: deliveryDate,
    amount: 47.1
  },
  {
    id: 47964,
    invoice_id: '10bf6a92-c912-4ac9-8420-74f1f387c8a9',
    invoice_number: 'INV-210135',
    actual_delivery_date: deliveryDate,
    amount: 64.2
  }
] as any) as Invoice[];

async function getConsolidationInvoices(tenant_id: number, group_id: number, delivery_date: Date) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getConsolidationInvoices (tenant_id: ${tenant_id}, group_id: ${group_id}, delivery_date: "${delivery_date}") {
          id
          xero_invoice_id
          delivery_date
          invoice_number
          amount
          buyer_name
          tenant_id
          group_id
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can get invoices', async () => {
    context.prisma.orderItem.groupBy.mockResolvedValueOnce(dummyOrderItems);
    context.prisma.customer.findMany.mockResolvedValueOnce(dummyCustomers);
    context.prisma.invoice.findMany.mockResolvedValueOnce(dummyInvoices);

    const tenantId = 1;
    const groupId = 1;
    const result = await getConsolidationInvoices(tenantId, groupId, deliveryDate);

    const formatedDeliveryDate = dayjs(deliveryDate).format('YYYY-MM-DD');

    const expectedResult = dummyInvoices.map((v) => {
      const orderItem = dummyOrderItems.find((el) => el.invoice_id === v.id);
      const customer = dummyCustomers.find((el) => el.id === orderItem.customer_buyer_id);
      return {
        id: v.id,
        xero_invoice_id: v.invoice_id,
        delivery_date: formatedDeliveryDate,
        invoice_number: v.invoice_number,
        amount: v.amount?.toFixed(2) || null,
        buyer_name: customer.name,
        tenant_id: tenantId,
        group_id: groupId
      };
    });

    expect(result).toMatchObject({
      getConsolidationInvoices: expectedResult
    });
  });

  it('server return empty data because cant find any invoice', async () => {
    context.prisma.orderItem.groupBy.mockResolvedValueOnce(([] as any) as OrderItem[]);
    context.prisma.customer.findMany.mockResolvedValueOnce(([] as any) as Customer[]);
    context.prisma.invoice.findMany.mockResolvedValueOnce(([] as any) as Invoice[]);

    const tenantId = 1;
    const groupId = 1;
    const result = await getConsolidationInvoices(tenantId, groupId, deliveryDate);

    expect(result).toMatchObject({
      getConsolidationInvoices: []
    });
  });
});
