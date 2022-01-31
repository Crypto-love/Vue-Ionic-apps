import { mutationField, nonNull, list, intArg } from 'nexus';
import { UserInputError } from 'apollo-server-express';
import { Invoice, PrismaClient } from '@treedots/prisma';
import { Context } from 'context';
import dayjs from 'dayjs';
import xeroApi from '@treedots/xero';

interface XeroInvoicePayload {
  id: number; // Our invoice id
  invoice_number: string; // Our invoice number
  xero_invoice_id?: string; // Xero's invoice id
  invoice_data: Record<string, any>; // Xero's invoice payload
}

const env = process.env.NODE_ENV;

export const uploadInvoicesToXero = mutationField('uploadInvoicesToXero', {
  type: 'StatusUploadInvoice',
  args: {
    tenant_id: nonNull(intArg()),
    invoice_ids: nonNull(list(intArg()))
  },
  resolve: async (_, { tenant_id, invoice_ids }, context) => {
    const xeroTenant = await context.prisma.tenantsIntegrationXero.findFirst({
      where: { tenant_id: tenant_id }
    });
    if (!xeroTenant) throw new UserInputError('Tenant not integrated with Xero');

    /* Generate Payload */
    const newInvoices: Array<XeroInvoicePayload> = [];
    const existingInvoices: Array<XeroInvoicePayload> = [];
    for (const invoiceId of invoice_ids) {
      const payload = await generateXeroInvoicePayload(context.prisma, invoiceId);
      if (payload.xero_invoice_id) existingInvoices.push(payload);
      else newInvoices.push(payload);
    }

    /* Upload and/or update the invoices to Xero */
    const createResult = await createXeroInvoices(context, xeroTenant.xero_tenant_id, newInvoices);
    const updateResult = await updateXeroInvoices(context, xeroTenant.xero_tenant_id, existingInvoices);

    return {
      success: [...createResult.success, ...updateResult.success],
      fail: [...createResult.fail, ...updateResult.fail]
    };
  }
});

/* This function is made based on stored procedure `p_get_invoice_by_id` */
async function generateXeroInvoicePayload(
  prisma: PrismaClient,
  invoiceId: number
): Promise<XeroInvoicePayload> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  /* Get the order items */
  const orderItems = await prisma.orderItem.groupBy({
    by: [
      'sku_id',
      'customer_buyer_id',
      'customer_seller_id',
      'order_item_status_id',
      'driver_delivery_user_id',
      'group_id',
      'sale_unit_price'
    ],
    where: {
      invoice_id: invoiceId,
      active: true,
      order: {
        order_status_id: { notIn: [-2, 1, -1, 10] }
      }
    },
    sum: {
      total_price: true,
      total_qty: true,
      tax: true
    }
  });
  if (orderItems.length == 0)
    throw new UserInputError(`There is no item for invoice ${invoice.invoice_number}`);

  /* Group the Ids of supplier & customer, and SKU */
  const supplierAndCustomerIds: Array<number> = [];
  const skuIds: Array<number> = [];
  orderItems.forEach((item) => {
    supplierAndCustomerIds.push(item.customer_buyer_id, item.customer_seller_id);
    skuIds.push(item.sku_id);
  });

  /* Get the customer and supplier info */
  const customerAndSupplier = await prisma.customer.findMany({
    where: { id: { in: supplierAndCustomerIds } },
    select: { id: true, name: true, account_number: true, customer_type_id: true }
  });

  /* Get the SKUs and tenant info */
  const skus = await prisma.sku.findMany({
    where: { id: { in: skuIds } },
    select: {
      id: true,
      name: true,
      product: {
        select: { tenant_id: true }
      }
    }
  });

  /* Get the order info */
  const orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: { invoice_id: invoiceId }
      }
    },
    select: { id: true, po_number: true }
  });

  const tenantId = skus[0].product.tenant_id;
  const customer = customerAndSupplier.find((v) => v.id === orderItems[0].customer_buyer_id); // Find customer type buyer

  /* Get the customer - tenant info */
  const customerTenant = await prisma.customerTenant.findFirst({
    where: { customer_id: customer.id, tenant_id: tenantId },
    select: { xero_customer_id: true, credit_term: true }
  });
  if (!customerTenant.xero_customer_id)
    throw new UserInputError(`${customer.name} has invalid Xero Customer ID`);

  /* Group the PO Number from the orders */
  let poNumbers: any = orders.map((v) => v.po_number).filter((v) => v && v.trim() !== '');
  poNumbers = poNumbers.length ? [...new Set(poNumbers)].toString() : invoice.code;

  /* Create the order items payload for the invoice */
  const items = orderItems.map((x) => {
    const supplier = customerAndSupplier.find((v) => v.id === x.customer_seller_id);
    const sku = skus.find((v) => v.id === x.sku_id);
    return {
      description: `S${supplier.account_number}-${x.sku_id} : ${sku.name}`,
      unitAmount: display4DpPrice(Number(x.sum.total_price) / x.sum.total_qty),
      lineAmount: display4DpPrice(Number(x.sum.total_price)),
      quantity: x.sum.total_qty,
      taxAmount: display4DpPrice(Number(x.sum.tax)),
      accountCode: 300 // This need to be dynamic in the future, not hardcoded like this. Because not every tenant can have accountCode of 300
    };
  });

  const invoiceNumber = getInvoiceNumber(invoice.invoice_number);
  const invoiceData = {
    type: 'ACCREC',
    invoiceNumber: invoiceNumber,
    reference: poNumbers,
    contact: { contactID: customerTenant.xero_customer_id },
    lineAmountTypes: 'Exclusive',
    lineItems: items,
    currencyCode: 'SGD',
    date: dayjs(invoice.actual_delivery_date).format('YYYY-MM-DD'),
    dueDate: getInvoiceDueDate(invoice, customerTenant.credit_term),
    status: ['staging', 'production'].includes(env) ? 'AUTHORISED' : 'DRAFT',
    brandingThemeID: tenantId == 1 && env == 'production' ? 'eff2128e-db68-47ca-b5aa-75c38562bb08' : null
  };

  return {
    id: invoice.id,
    invoice_number: invoiceNumber,
    xero_invoice_id: invoice.invoice_id,
    invoice_data: invoiceData
  };
}

function getInvoiceNumber(invoiceNumber: string) {
  switch (env) {
    case 'development':
      // return `INV-${Date.now()}-DEV`;
      return `${invoiceNumber}-DEV`;
    case 'testing':
      return `${invoiceNumber}-TESTING`;
    case 'staging':
      return `${invoiceNumber}-STAGING`;
    default:
      return invoiceNumber;
  }
}

function getInvoiceDueDate(invoice: Invoice, creditTermCustomer?: number): string {
  if (invoice.due_date) return dayjs(invoice.due_date).format('YYYY-MM-DD');

  const actualDeliveryDate = dayjs(invoice.actual_delivery_date);

  if (!creditTermCustomer || creditTermCustomer === 0) return actualDeliveryDate.format('YYYY-MM-DD');

  /* Always return sunday */
  if (creditTermCustomer === 7)
    return actualDeliveryDate.get('day') === 0 // Day of Week (Sunday as 0, Saturday as 6)
      ? actualDeliveryDate.format('YYYY-MM-DD')
      : actualDeliveryDate.startOf('week').add(7, 'day').format('YYYY-MM-DD');

  /* Return last day of next month */
  if (creditTermCustomer === 30)
    return actualDeliveryDate.add(1, 'month').endOf('month').format('YYYY-MM-DD');

  return actualDeliveryDate.add(creditTermCustomer, 'day').format('YYYY-MM-DD');
}

function display4DpPrice(price: number) {
  return (Math.round(price * 10000) / 10000).toFixed(4);
}

async function createXeroInvoices(
  context: Context,
  xeroTenantId: string,
  invoices: Array<XeroInvoicePayload>
): Promise<Record<string, any>> {
  const result = { success: [], fail: [] };

  if (invoices.length === 0) return result;

  try {
    const newInvoices = {
      invoices: invoices.map((v) => v.invoice_data)
    };
    const summarizeErrors = false;
    const unitdp = 4;
    const response = await xeroApi.fetch({
      xeroTenantId: xeroTenantId,
      methodName: 'createInvoices',
      methodParams: [newInvoices, summarizeErrors, unitdp]
    });
    const xeroInvoices: Array<any> = response['invoices'] || [];

    for (const xeroInvoice of xeroInvoices) {
      /* Find our invoice id */
      const xeroInvoicePayload = invoices.find((v) => v.invoice_number == xeroInvoice.invoiceNumber);

      if (xeroInvoice.hasErrors) {
        const errorMessage =
          xeroInvoice.validationErrors && xeroInvoice.validationErrors.length
            ? `, ${xeroInvoice.validationErrors[0].message}`
            : '';
        result.fail.push(`${xeroInvoicePayload.invoice_number}${errorMessage}`);
      } else {
        result.success.push(xeroInvoicePayload.invoice_number);
        /* Add `if` statement just to be safe */
        if (xeroInvoicePayload) {
          await updateInvoiceTable(context, xeroInvoicePayload.id, xeroInvoice.invoiceID);
        }
      }
    }
  } catch (error) {
    throw new UserInputError(error.message);
  } finally {
    return result;
  }
}

async function updateXeroInvoices(
  context: Context,
  xeroTenantId: string,
  invoices: Array<XeroInvoicePayload>
): Promise<Record<string, any>> {
  const result = { success: [], fail: [] };
  for (const invoice of invoices) {
    try {
      const invoiceData = {
        invoices: [invoice.invoice_data]
      };
      const unitdp = 4;
      const response = await xeroApi.fetch({
        xeroTenantId: xeroTenantId,
        methodName: 'updateInvoice',
        methodParams: [invoice.xero_invoice_id, invoiceData, unitdp]
      });
      const xeroInvoices: Array<any> = response['invoices'] || [];
      if (xeroInvoices.length === 0) continue;

      result.success.push(invoice.invoice_number);

      /* Find the our invoice id */
      const xeroInvoicePayload = invoices.find((v) => v.invoice_number == xeroInvoices[0].invoiceNumber);

      /* Add `if` statement just to be safe */
      if (xeroInvoicePayload) {
        await updateInvoiceTable(context, xeroInvoicePayload.id);
      }
    } catch (error) {
      result.fail.push(`${invoice.invoice_number}, ${error.message}`);
    }
  }

  return result;
}

async function updateInvoiceTable(context: Context, invoiceId: number, xeroInvoiceId?: string) {
  await context.prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      last_user_id: context.credential.userId,
      invoice_id: xeroInvoiceId || undefined
    }
  });
}
