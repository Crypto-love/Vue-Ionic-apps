import gql from 'graphql-tag';

export const queryAllSuppliers = gql`
  query getAllSuppliers($hubId: Int) {
    getAllSuppliers(hubId: $hubId) {
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
      active
      xero_id
      voucherify_id
      direction
      whatsapp_link
      tenant {
        logo
      }
    }
  }
`;

export const getAllSupplierDashboardAdmin = gql`
  query getAllSupplierDashboardAdmin($supplierId: Int, $page: Int, $perPage: Int, $keyword: String) {
    getAllSupplierDashboardAdmin(supplierId: $supplierId, page: $page, perPage: $perPage, keyword: $keyword) {
      Customer {
        id
        name
        alias_name
        account_number
        customer_type_id
        tenant_id
        credit_term
        payment_type
        minimum_order
        delivery_charge
        delivery_instruction
        profile
        active
        halal_products
        cod
        persons {
          id
          first_name
          last_name
          phone
          position
          is_default
          active
        }
        address {
          id
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
          address_type_id
          active
          country_id
          country {
            name
            description
            currency_code
            currency_symbol
            active
          }
          is_default
        }
        tenant {
          id
          registration_number
          tax_registration_number
          email_notification
          merchant_id
          tax_rate
          building_name
          street_name
          unit_number
          email
          first_name
          last_name
          email_notification
          class_id
          tenant_class {
            name
          }
          key_person {
            id
            customer_id
            first_name
            last_name
            email
            phone
            active
          }
          default_credit_card_term
          logo
          lead_days
          commission_rate
        }
      }
      total_rows
      total_page
    }
  }
`;

export const addNewSupplierDashboardAdmin = gql`
  mutation addSupplierDashboardAdmin($data: AddSupplierDashboardAdmin!) {
    addSupplierDashboardAdmin(data: $data) {
      id
      merchant_id
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
      logo
      lead_days
      commission_rate
      xeroIntegration {
        id
        tenant_id
        xero_tenant_id
        xero_token_set
        created_at
        created_by
        updated_at
        updated_by
        active
      }
      tenant_class {
        name
      }
      key_person {
        phone
      }
    }
  }
`;

export const updateNewSupplierDashboardAdmin = gql`
  mutation updateSupplierDashboardAdmin($data: AddSupplierDashboardAdmin!) {
    updateSupplierDashboardAdmin(data: $data) {
      id
      merchant_id
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
      logo
      lead_days
      commission_rate
      xeroIntegration {
        id
        tenant_id
        xero_tenant_id
        xero_token_set
        created_at
        created_by
        updated_at
        updated_by
        active
      }
      tenant_class {
        name
      }
      key_person {
        phone
      }
    }
  }
`;

export const getAllTenantHubs = gql`
  query getTenantHubs($tenantId: [Int], $hubId: [Int], $active: Boolean) {
    getTenantHubs(tenantId: $tenantId, hubId: $hubId, active: $active) {
      id
      customer_id
      tenant_id
      active
      xero_customer_id
      alias_name
      cod
      credit_term
      payment_type
      delivery_instruction
      delivery_charge
      minimum_order
      commission_rate
      auto_create_spree
      customer {
        id
        name
        alias_name
      }
      tenant {
        first_name
        last_name
        email
        lead_days
        commission_rate
        logo
        tenant {
          name
          id
          alias_name
          DeliveryDay {
            day_id
            day {
              id
              name
              description
            }
          }
          active
        }
      }
    }
  }
`;

export const addCustomerTenant = gql`
  mutation addCustomerTenant($data: CustomerTenantInput!) {
    addCustomerTenant(data: $data) {
      id
      customer_id
      tenant_id
      customer {
        id
        name
        alias_name
      }
      tenant {
        first_name
        last_name
        email
        lead_days
        commission_rate
        logo
        tenant {
          name
          id
          alias_name
          DeliveryDay {
            day_id
            day {
              id
              name
              description
            }
          }
          active
        }
      }
    }
  }
`;

export const updateCustomerTenant = gql`
  mutation updateCustomerTenant($data: CustomerTenantInput!) {
    updateCustomerTenant(data: $data) {
      id
      customer_id
      tenant_id
      customer {
        id
        name
        alias_name
      }
      tenant {
        first_name
        last_name
        email
        lead_days
        commission_rate
        logo
        tenant {
          name
          id
          alias_name
          DeliveryDay {
            day_id
            day {
              id
              name
              description
            }
          }
          active
        }
      }
    }
  }
`;
export const updateProductImages = gql`
  mutation($data: String!, $csvData: String!) {
    updateProductImages(data: $data, csvData: $csvData)
  }
`;
export const updateCustomer = gql`
  mutation updateCustomer($customer: UpdateCustomerInput!) {
    updateCustomer(customer: $customer) {
      id
      name
      alias_name
      account_number
      profile
      customer_type_id
      halal_products
      cod
      credit_term
      payment_type
      delivery_instruction
      delivery_charge
      minimum_order
      active
    }
  }
`;
export const getSupplierStates = gql`
  query getSupplierStates($customer_id: Int) {
    getSupplierStates(customer_id: $customer_id) {
      supplier {
        id
        name
        alias_name
        active
      }
      supplier_id
      state {
        id
        name
        country_id
        country {
          id
          name
          description
          currency_code
          currency_symbol
          active
        }
        active
      }
      state_id
      active
    }
  }
`;
export const allStates = gql`
  query allStates($country_id: Int) {
    allStates(country_id: $country_id) {
      id
      name
      country_id
      country {
        id
        name
        description
        currency_code
        currency_symbol
        active
      }
      active
    }
  }
`;
export const createSupplierStates = gql`
  mutation createSupplierStates($supplier_id: Int!, $states: [Int]) {
    createSupplierStates(supplier_id: $supplier_id, states: $states)
  }
`;
export const deleteSupplierState = gql`
  mutation deleteSupplierState($supplier_id: Int!, $state_id: Int!) {
    deleteSupplierState(supplier_id: $supplier_id, state_id: $state_id)
  }
`;
export const getSupplierUsers = gql`
  query getSupplierUsers(
    $active: Boolean
    $country: String
    $userType: [Int]!
    $buyerType: Int
    $page: Int
    $perPage: Int
    $keyword: String
    $supplierId: Int
  ) {
    getSupplierUsers(
      active: $active
      country: $country
      userType: $userType
      buyerType: $buyerType
      page: $page
      perPage: $perPage
      keyword: $keyword
      supplierId: $supplierId
    ) {
      supplier_users {
        id
        email
        mobile
        full_name
        first_name
        last_name
        mobile
        gender
        user_type_id
        userType {
          id
          name
          description
          active
        }
        country_id
        country {
          id
          name
          description
          active
        }
        buyer_type
        image
        active
        tenant {
          tenant {
            id
            name
            alias_name
            active
          }
        }
      }
      total_rows
      total_page
    }
  }
`;
export const topUpUserBalanceDonation = gql`
  mutation topUpUserBalanceDonation($jsonTopUpData: String!) {
    topUpUserBalanceDonation(jsonTopUpData: $jsonTopUpData)
  }
`;
export const getEwalletBalance = gql`
  query getEwalletBalance($userId: Int!) {
    getEwalletBalance(userId: $userId) {
      available
      locked
      pending_withdraw
    }
  }
`;
export const updateSupplierUser = gql`
  mutation updateSupplierUser($jsonData: String!) {
    updateSupplierUser(jsonData: $jsonData) {
      id
      email
      mobile
      full_name
      first_name
      last_name
      mobile
      gender
      user_type_id
      userType {
        id
        name
        description
        active
      }
      country_id
      country {
        id
        name
        description
        active
      }
      buyer_type
      image
      active
      tenant {
        tenant {
          id
          name
          alias_name
          active
        }
      }
    }
  }
`;
export const getSupplierUserDetails = gql`
  query getSupplierUserDetails($userId: Int!) {
    getSupplierUserDetails(userId: $userId) {
      id
      email
      mobile
      full_name
      first_name
      last_name
      mobile
      gender
      user_type_id
      userType {
        id
        name
        description
        active
      }
      country_id
      country {
        id
        name
        description
        active
      }
      buyer_type
      image
      active
      tenant {
        tenant {
          id
          name
          alias_name
          active
        }
      }
    }
  }
`;

export const updateMultipleSupplierActive = gql`
  mutation updateMultipleSupplierActive($userIdList: [Int]!, $active: Boolean!) {
    updateMultipleSupplierActive(userIdList: $userIdList, active: $active)
  }
`;
export const deleteSupplierUsers = gql`
  mutation deleteSupplierUsers($userIdList: [Int]!) {
    deleteSupplierUsers(userIdList: $userIdList)
  }
`;
export const createNewSupplierUserPassword = gql`
  mutation createNewSupplierUserPassword($userId: Int!, $newPassword: String!) {
    createNewSupplierUserPassword(userId: $userId, newPassword: $newPassword) {
      id
      email
      mobile
      full_name
      first_name
      last_name
      mobile
      gender
      user_type_id
      userType {
        id
        name
        description
        active
      }
      country_id
      country {
        id
        name
        description
        active
      }
      buyer_type
      image
      active
      tenant {
        tenant {
          id
          name
          alias_name
          active
        }
      }
    }
  }
`;
export const getAllCustomers = gql`
  query getAllCustomers(
    $tenantId: Int
    $hubId: Int
    $active: Boolean
    $customer_type_id: Int
    $countryId: Int
    $bussinessUserId: Int
    $keyword: String
    $hub: Boolean
  ) {
    getAllCustomers(
      tenantId: $tenantId
      hubId: $hubId
      active: $active
      customer_type_id: $customer_type_id
      countryId: $countryId
      bussinessUserId: $bussinessUserId
      keyword: $keyword
      hub: $hub
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
      address {
        country {
          id
          name
          description
        }
      }
    }
  }
`;
export const getAllCustomerByBusinessUserId = gql`
  query getAllCustomerByBusinessUserId($businessUserId: Int!) {
    getAllCustomerByBusinessUserId(businessUserId: $businessUserId) {
      customer {
        id
        name
        alias_name
        active
        address {
          id
          country {
            id
            name
            description
          }
          state
          city
          road
          building
          street_number
          floor_number
          stall
          unit
          latlng
          active
          is_default
        }
      }
    }
  }
`;
export const tagBusinessCustomer = gql`
  mutation tagBusinessCustomer($userId: Int!, $customerId: Int!) {
    tagBusinessCustomer(userId: $userId, customerId: $customerId)
  }
`;
export const untagBusinessCustomer = gql`
  mutation untagBusinessCustomer($userId: Int!, $customerId: Int!) {
    untagBusinessCustomer(userId: $userId, customerId: $customerId)
  }
`;
export const addSupplierBasicInformations = gql`
  mutation addSupplierBasicInformations(
    $basicInfoJsonData: String!
    $operatingHoursJsonData: String!
    $deliveryHoursJsonData: String!
    $stateListJsonData: String!
    $internalUserJsonData: String!
  ) {
    addSupplierBasicInformations(
      basicInfoJsonData: $basicInfoJsonData
      operatingHoursJsonData: $operatingHoursJsonData
      deliveryHoursJsonData: $deliveryHoursJsonData
      stateListJsonData: $stateListJsonData
      internalUserJsonData: $internalUserJsonData
    ) {
      id
      tenant {
        id
        name
        alias_name
        active
      }
    }
  }
`;
export const addGroupBuySettings = gql`
  mutation addGroupBuySettings($supplierId: Int!, $groupBuySettingJson: String!) {
    addGroupBuySettings(supplierId: $supplierId, groupBuySettingJson: $groupBuySettingJson)
  }
`;
export const addBusinessSettings = gql`
  mutation addBusinessSettings($supplierId: Int!, $businessDataJson: String!, $statementDataJson: String!) {
    addBusinessSettings(
      supplierId: $supplierId
      businessDataJson: $businessDataJson
      statementDataJson: $statementDataJson
    )
  }
`;
export const addDefaultSettings = gql`
  mutation addDefaultSettings(
    $supplierId: Int!
    $defaultSettingJson: String!
    $billingAddressJson: String!
    $postPaymentMethodJson: String!
  ) {
    addDefaultSettings(
      supplierId: $supplierId
      defaultSettingJson: $defaultSettingJson
      billingAddressJson: $billingAddressJson
      postPaymentMethodJson: $postPaymentMethodJson
    )
  }
`;
export const getAllSupplierFrequencyTypes = gql`
  query getAllSupplierFrequencyTypes {
    getAllSupplierFrequencyTypes {
      id
      name
      descriptions
      field_name
      active
    }
  }
`;
export const getSupplierBasicInfo = gql`
  query getSupplierBasicInfo($supplierId: Int!) {
    getSupplierBasicInfo(supplierId: $supplierId) {
      id
      registration_number
      tax_registration_number
      email
      email_notification
      commission_rate
      lead_days
      direct_price
      automatic_connection_approval
      discoverable
      send_statement_on_regular_basis
      tax_rate
      default_credit_card_term
      paynow
      interbank_fund_transfer
      cheque
      cash_on_delivery
      offer_credit_term_at_app_checkout
      offer_credit_term_type_id
      tenant {
        id
        name
        alias_name
        active
        halal_products
        profile
        active
        minimum_order
        DeliveryDay {
          day {
            id
            name
            description
            active
          }
          open_hour
          open_minute
          close_hour
          close_minute
        }
        hours {
          day {
            id
            name
            description
            active
          }
          open_hour
          open_minute
          close_hour
          close_minute
          active
        }
        SupplierState {
          state {
            id
            name
            country_id
            country {
              id
              name
              description
              active
            }
            active
          }
        }
        defaultAddress {
          id
          country_id
          country {
            id
            name
            description
            active
          }
          state
          city
          road
          building
          street_number
          floor_number
          stall
          unit
          active
          is_default
        }
      }
    }
  }
`;
export const updateSupplierBasicInfo = gql`
  mutation updateSupplierBasicInfo($supplierId: Int!, $basicInfoJsonData: String!) {
    updateSupplierBasicInfo(supplierId: $supplierId, basicInfoJsonData: $basicInfoJsonData)
  }
`;
export const updateSupplierOpeningHours = gql`
  mutation updateSupplierOpeningHours($supplierId: Int!, $operatingHoursJsonData: String!) {
    updateSupplierOpeningHours(supplierId: $supplierId, operatingHoursJsonData: $operatingHoursJsonData)
  }
`;
export const updateSupplierDeliveryHours = gql`
  mutation updateSupplierDeliveryHours($supplierId: Int!, $deliveryHoursJsonData: String!) {
    updateSupplierDeliveryHours(supplierId: $supplierId, deliveryHoursJsonData: $deliveryHoursJsonData)
  }
`;
export const getSupplierStatementAccount = gql`
  query getSupplierStatementAccount($supplierId: Int!) {
    getSupplierStatementAccount(supplierId: $supplierId) {
      id
      supplier_id
      statement_type_id
      statement_type {
        id
        name
        descriptions
      }
      frequency_type_id
      frequency_type {
        id
        name
        descriptions
        field_name
        active
      }
      value
    }
  }
`;
export const getSupplierPostPaymentMethod = gql`
  query getSupplierPostPaymentMethod($supplierId: Int!) {
    getSupplierPostPaymentMethod(supplierId: $supplierId) {
      id
      supplier_payment_method_option {
        id
        name
        descriptions
        active
      }
      supplier_payment_method_detail {
        uen_number
        phone_number
        company_name
        bank_id
        bank {
          bank_name
        }
        account_name
        account_number
        active
      }
    }
  }
`;
export const updateSupplierDefaultSettings = gql`
  mutation updateSupplierDefaultSettings(
    $supplierId: Int!
    $defaultSettingJson: String!
    $billingAddressJson: String!
    $postPaymentMethodJson: String!
  ) {
    updateSupplierDefaultSettings(
      supplierId: $supplierId
      defaultSettingJson: $defaultSettingJson
      billingAddressJson: $billingAddressJson
      postPaymentMethodJson: $postPaymentMethodJson
    )
  }
`;
