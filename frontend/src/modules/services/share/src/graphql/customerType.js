import gql from 'graphql-tag';

export const getCustomerTypes = gql`
  query getCustomerTypes($active: Boolean) {
    getCustomerTypes(active: $active) {
      id
      name
      description
      active
    }
  }
`;
