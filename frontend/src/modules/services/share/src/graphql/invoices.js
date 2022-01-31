import gql from 'graphql-tag';

export const uploadInvoicesToXero = gql`
  mutation uploadInvoicesToXero($tenant_id: Int!, $invoice_ids: [Int]!) {
    uploadInvoicesToXero(tenant_id: $tenant_id, invoice_ids: $invoice_ids) {
      success
      fail
    }
  }
`;

export const getConsolidationInvoices = gql`
  query getConsolidationInvoices($tenant_id: Int!, $group_id: Int!, $delivery_date: String!) {
    getConsolidationInvoices(tenant_id: $tenant_id, group_id: $group_id, delivery_date: $delivery_date) {
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
`;
