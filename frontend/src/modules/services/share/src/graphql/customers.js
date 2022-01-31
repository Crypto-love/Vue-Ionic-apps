import gql from 'graphql-tag';

export const getAllCustomers = gql`
  query getAllCustomers($tenantId: Int, $hubId: Int, $active: Boolean, $customer_type_id: Int) {
    getAllCustomers(
      tenantId: $tenantId
      hubId: $hubId
      active: $active
      customer_type_id: $customer_type_id
    ) {
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

export const getCustomerDetailByTenant = gql`
  query getCustomerDetailByTenant($customer_id: Int!, $tenant_id: Int!) {
    getCustomerDetailByTenant(customer_id: $customer_id, tenant_id: $tenant_id) {
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
      address {
        active
        address_type_id
        type {
          name
        }
        building
        city
        country_id
        country {
          name
          description
        }
        floor_number
        id
        postal_code
        road
        stall
        state
        street_number
        unit
      }
      persons {
        active
        email
        first_name
        id
        last_name
        phone
        position
      }
    }
  }
`;

export const addCustomer = gql`
  mutation addCustomer($customer: AddCustomerInput!, $is_parent: Boolean!) {
    addCustomer(customer: $customer, is_parent: $is_parent) {
      id
      name
    }
  }
`;

export const updateCustomer = gql`
  mutation updateCustomer($customer: UpdateCustomerInput!) {
    updateCustomer(customer: $customer) {
      id
      name
    }
  }
`;
