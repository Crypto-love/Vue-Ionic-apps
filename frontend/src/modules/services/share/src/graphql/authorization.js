import gql from 'graphql-tag';

const requestData = `{
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
}`;

export const loginDashboard = gql`
  mutation($identity: String!, $password: String!) {
    signIn(identity: $identity, password: $password) ${requestData}
  }
`;

export const requestJWT = gql`
  mutation($oldToken: String!) {
    requestJWT(oldToken: $oldToken) ${requestData}
  }
`;

export const me = gql`
  mutation {
    me ${requestData}
  }
`;
