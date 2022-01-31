import gql from 'graphql-tag';

export const allCountries = gql`
  query allCountries($active: Boolean) {
    allCountries(active: $active) {
      active
      currency_code
      currency_symbol
      description
      id
      name
    }
  }
`;

export const checkUser = gql`
  query checkUser($email: String, $mobile: String, $otp: String) {
    checkUser(email: $email, mobile: $mobile, otp: $otp) {
      email
      mobile
      first_name
      last_name
    }
  }
`;

export const signIn = gql`
  mutation($identity: String!, $password: String!) {
    signIn(identity: $identity, password: $password) {
      address {
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
      }
      birth_date
      buyer_type
      country {
        id
        name
        description
        currency_code
        currency_symbol
      }
      email
      first_name
      gender
      id
      image
      last_name
      mobile
      stripe_card_id
      stripe_customer_id
      tokenJWT
      token
      email
      type {
        id
        name
        description
      }
      tenant {
        id
        registration_number
        tax_registration_number
        tax_rate
        building_name
        street_name
        unit_number
        email
        first_name
        last_name
        email_notification
        class_id
        default_credit_card_term
        tenant {
          id
          name
        }
        xeroIntegration {
          xero_tenant_id
        }
      }
      user_type_id
      username
    }
  }
`;

export const getSeletedHub = gql`
  query {
    getSelectedHub {
      tutorial_tick_status
      hub {
        alias_name
        beef_products
        delivery_charge
        halal_products
        hub
        hub_can_delivery
        id
        name
        whatsapp_link
        defaultAddress {
          asString2
        }
      }
    }
  }
`;

export const addUser = gql`
  mutation addUser(
    $first_name: String!
    $last_name: String!
    $country_id: Int!
    $customer_id: Int!
    $mobile: String!
    $user_type_id: Int!
    $buyer_type: Int!
    $password: String!
    $email: String
  ) {
    addUser(
      item: {
        first_name: $first_name
        last_name: $last_name
        country_id: $country_id
        customer_id: $customer_id
        email: $email
        mobile: $mobile
        user_type_id: $user_type_id
        buyer_type: $buyer_type
        password: $password
      }
    )
  }
`;
