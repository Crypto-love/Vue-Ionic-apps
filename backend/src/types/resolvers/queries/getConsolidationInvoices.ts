import { UserInputError } from 'apollo-server-express';
import { intArg, nonNull, queryField, stringArg } from 'nexus';

/* This query is replacement for sql view of `v_consolidation_xero_invoices` */
export const getConsolidationInvoices = queryField((t) => {
  t.list.field('getConsolidationInvoices', {
    type: 'ConsolidationInvoice',
    args: {
      tenant_id: nonNull(intArg()),
      group_id: nonNull(intArg()),
      delivery_date: nonNull(stringArg())
    },
    resolve: async (_, { tenant_id, group_id, delivery_date }, { prisma }) => {
      try {
        const orderItems = await prisma.orderItem.groupBy({
          by: ['invoice_id', 'customer_buyer_id'],
          where: {
            group_id: group_id,
            active: true,
            invoice_id: { not: null },
            sku: {
              product: {
                tenant_id: tenant_id
              }
            },
            order: {
              delivery_date: delivery_date,
              order_status_id: { notIn: [-2, -1, 1, 10] }
            }
          }
        });

        const mapCustomerInvoice: Record<number, number> = {};
        orderItems.forEach((v) => (mapCustomerInvoice[v.invoice_id] = v.customer_buyer_id));

        const customers = await prisma.customer.findMany({
          where: {
            id: { in: orderItems.map((v) => v.customer_buyer_id) }
          },
          select: {
            id: true,
            name: true
          }
        });

        const mapCustomer: Record<number, string> = {};
        customers.forEach((v) => (mapCustomer[v.id] = v.name));

        const invoices = await prisma.invoice.findMany({
          where: {
            id: { in: orderItems.map((v) => v.invoice_id) }
          },
          select: {
            id: true,
            invoice_id: true,
            invoice_number: true,
            actual_delivery_date: true,
            amount: true
          },
          orderBy: { id: 'desc' }
        });

        return invoices.map((v) => {
          const customerId = mapCustomerInvoice[v.id];
          return {
            id: v.id,
            xero_invoice_id: v.invoice_id,
            delivery_date: v.actual_delivery_date,
            invoice_number: v.invoice_number,
            amount: v.amount?.toFixed(2) || null,
            buyer_name: customerId && mapCustomer[customerId] ? mapCustomer[customerId] : null,
            tenant_id,
            group_id
          };
        });
      } catch (error) {
        throw new UserInputError(error.message);
      }
    }
  });
});
