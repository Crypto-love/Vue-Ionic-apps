import gql from 'graphql-tag';

export const getAddress = gql`
  query getAddress($customerId: Int, $addressTypeId: Int) {
    getAddress(customerId: $customerId, addressTypeId: $addressTypeId) {
      id
      customer_id
      floor_number
      street_number
      road
      building
      unit
      stall
      city
      state
      postal_code
      latlng
      country_id
      address_type_id
      active
      is_default
    }
  }
`;

export const updateMyCustomerAddress = gql`
  mutation updateMyCustomerAddress($data: CustomerAddressInput!) {
    updateMyCustomerAddress(data: $data) {
      id
      customer_id
      floor_number
      street_number
      road
      building
      unit
      stall
      city
      state
      postal_code
      latlng
      country_id
      address_type_id
      active
      is_default
    }
  }
`;
