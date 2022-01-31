import gql from 'graphql-tag';

export const getB2cUserByTenant = gql`
  query getB2cUserByTenant($tenantId: Int!) {
    getB2cUserByTenant(tenantId: $tenantId) {
      id
      email
      mobile
      full_name
      stripe_customer_id
      stripe_card_id
    }
  }
`;

export const getUserCustomerDetails = gql`
  query getUserCustomers {
    getUserCustomers {
      user_id
      customer {
        id
        name
        account_number
        group_id
        customer_type {
          id
          name
          description
        }
        tenant_id
        payment_type
        address {
          street_number
          road
          building
        }
        persons {
          id
          first_name
          last_name
          email
        }
      }
    }
  }
`;
