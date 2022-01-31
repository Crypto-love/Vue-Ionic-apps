import gql from 'graphql-tag';

export const getDeliveryDays = gql`
  query getDeliveryDays($tenantCustomerId: Int) {
    getDeliveryDays(tenantCustomerId: $tenantCustomerId) {
      id
      customer_id
      day_id
      Tenant {
        name
        active
        tenant_id
      }
      day {
        id
        name
        description
        active
      }
    }
  }
`;

export const addDeliveryDays = gql`
  mutation addDeliveryDays($jsonData: String) {
    addDeliveryDays(jsonData: $jsonData) {
      id
      customer_id
      day_id
      Tenant {
        name
        active
        tenant_id
      }
      day {
        id
        name
        description
        active
      }
    }
  }
`;

export const deleteDeliveryDays = gql`
  mutation deleteDeliveryDays($jsonData: String) {
    deleteDeliveryDays(jsonData: $jsonData) {
      id
      customer_id
      day_id
      Tenant {
        name
        active
        tenant_id
      }
      day {
        id
        name
        description
        active
      }
    }
  }
`;
