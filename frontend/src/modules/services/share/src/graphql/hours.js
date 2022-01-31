import gql from 'graphql-tag';

export const getHours = gql`
  query getHours($customerId: Int) {
    getHours(customerId: $customerId) {
      active
      close_hour
      close_minute
      customer_id
      day {
        id
        name
        description
        active
      }
      day_id
      id
      open_hour
      open_minute
    }
  }
`;

export const updateHours = gql`
  mutation updateHours($jsonData: String!) {
    updateHours(jsonData: $jsonData) {
      id
      customer_id
      day_id
      open_hour
      open_minute
      close_hour
      close_minute
      active
      day {
        id
        name
        description
        active
      }
    }
  }
`;
