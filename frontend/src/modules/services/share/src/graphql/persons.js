import gql from 'graphql-tag';

export const getPersons = gql`
  query getPersons($customerId: Int) {
    getPersons(customerId: $customerId) {
      id
      customer_id
      first_name
      last_name
      email
      phone
      fax
      position
      is_default
      active
    }
  }
`;

export const updatePersons = gql`
  mutation updatePerson($jsonData: String!) {
    updatePerson(jsonData: $jsonData) {
      id
      customer_id
      first_name
      last_name
      email
      phone
      fax
      position
      is_default
      active
    }
  }
`;
