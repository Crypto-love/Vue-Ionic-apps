import gql from 'graphql-tag';

// export const getUsersByTypeId = gql`
//   query getUsersByTypeId($typeId: Int) {
//     getUsersByTypeId(userTypeId: $typeId) {
//       id
//       email
//       mobile
//       full_name
//       active
//     }
//   }
// `;

// export const updateUserStatus = gql`
//   mutation updateUserStatus($userId: Int!, $active: Boolean!) {
//     updateUserStatus(userId: $userId, active: $active) {
//       id
//       active
//     }
//   }
// `;

export const getAllAdvocates = gql`
  query getAllAdvocates($page: Int, $perPage: Int, $keyword: String, $advocateId: Int, $statusList: [Int]) {
    getAllAdvocates(
      page: $page
      perPage: $perPage
      keyword: $keyword
      advocateId: $advocateId
      statusList: $statusList
    ) {
      advocate_users {
        id
        image
        full_name
        email
        mobile
        country {
          id
          name
          description
        }
        user_type_id
        referred_number
        status_approval
        active
      }
      total_rows
      total_page
    }
  }
`;

/*
ex params: "{\"id\":26420,\"image\":null,\"full_name\":\"Benjamin   Seah\",\"email\":\"chonglim@gmail.com**\",\"mobile\":\"60126786332*\",\"country\":{\"id\":127,\"name\":\"MY\",\"description\":\"Malaysia\"},\"user_type_id\":11,\"referred_number\":\"12\",\"status_approval\":1,\"active\":true}"
*/
export const updateAdvocateDetails = gql`
  mutation updateAdvocateDetails($jsonData: String!) {
    updateAdvocateDetails(jsonData: $jsonData) {
      id
      first_name
      last_name
      mobile
      email
      referred_number
      status_approval
      country {
        id
        name
        description
        active
      }
      user_type_id
      active
    }
  }
`;

export const advocateApproval = gql`
  mutation advocateApproval($listId: [Int], $statusApproval: Int) {
    advocateApproval(listId: $listId, statusApproval: $statusApproval)
  }
`;

export const getCollectionPointByUserId = gql`
  query getCollectionPointByUserId($userId: Int) {
    getCollectionPointByUserId(userId: $userId) {
      user_id
      active
      customer {
        id
        halal_products
        beef_products
        whatsapp_link
        profile
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
          floor_number
          unit
          stall
          postal_code
          latlng
        }
        CustomerTenant {
          tenant {
            id
            logo
            tenant {
              id
              name
              alias_name
            }
          }
        }
      }
    }
  }
`;

export const getBankListByUserId = gql`
  query getBankListByUserId($userId: Int) {
    getBankListByUserId(userId: $userId) {
      id
      bank_id
      bank {
        bank_name
      }
      account_name
      account_number
      bank_code
      branch_code
      active
    }
  }
`;

/*
  ex params: "{\"id\":12459,\"country_id\":193,\"state\":\"singapore\",\"city\":\"Singapore\",\"road\":\"simei stree 5\",\"street_number\":\"12\",\"building\":\"simei mall\",\"floor_number\":\"2\",\"unit\":\"11\",\"stall\":\"230\",\"postal_code\":\"12345\",\"latlng\":{\"lat\":3.1315872,\"lng\":101.4613037}}"
*/
export const updateCollectionPointDetails = gql`
  mutation updateCollectionPointDetails($jsonAddressDetails: String!) {
    updateCollectionPointDetails(jsonAddressDetails: $jsonAddressDetails) {
      id
      country {
        id
        name
        description
      }
      state
      city
      road
      street_number
      building
      floor_number
      unit
      stall
      postal_code
      latlng
    }
  }
`;

export const verifyCollectionPoint = gql`
  mutation verifyCollectionPoint($userId: Int, $collectionPointId: Int) {
    verifyCollectionPoint(userId: $userId, collectionPointId: $collectionPointId) {
      id
      user_id
      customer_id
      active
      user {
        id
        first_name
        last_name
        mobile
        email
        referred_number
        status_approval
        country {
          id
          name
          description
          active
        }
        user_type_id
        active
      }
      customer {
        id
        name
        alias_name
        active
      }
    }
  }
`;

/*
  ex params: "{\"id\":1,\"bank_name\":\"MANDIRI\",\"account_number\":\"12345679890\",\"account_name\":\"Umar Djafar Djou\",\"bank_code\":\"0001\",\"branch_code\":\"0002\",\"country_id\":193}"
*/
export const updateBankAccountDetails = gql`
  mutation updateBankAccountDetails($jsonData: String!) {
    updateBankAccountDetails(jsonData: $jsonData) {
      id
      bank_id
      bank {
        id
        bank_name
        country {
          id
          name
          description
        }
      }
      account_number
      account_name
      bank_code
      branch_code
    }
  }
`;

export const verifyBankAccount = gql`
  mutation verifyBankAccount($bankDetailId: Int) {
    verifyBankAccount(bankDetailId: $bankDetailId) {
      id
      bank_id
      account_name
      account_number
      bank_code
      branch_code
      active
    }
  }
`;

export const getAdvocateNewRequestCount = gql`
  query getAdvocateNewRequestCount {
    getAdvocateNewRequestCount {
      new_hosts
      new_collection_points
      new_bank_accounts
    }
  }
`;

export const getAllBanks = gql`
  query getAllBanks($countryId: Int!) {
    getAllBanks(countryId: $countryId) {
      id
      bank_name
      country_id
      acronym
    }
  }
`;

export const addNewAdvocate = gql`
  mutation addNewAdvocate($jsonData: String!) {
    addNewAdvocate(jsonData: $jsonData)
  }
`;

export const addNewCollectionPoint = gql`
  mutation addNewCollectionPoint($jsonData: String!) {
    addNewCollectionPoint(jsonData: $jsonData)
  }
`;

export const addNewBankAccount = gql`
  mutation addNewBankAccount($jsonData: String!) {
    addNewBankAccount(jsonData: $jsonData)
  }
`;

export const getAllSuppliersAdvocate = gql`
  query getAllSuppliers($countryId: Int!, $keyword: String, $collectionPointId: Int!) {
    getAllSuppliers(countryId: $countryId, keyword: $keyword, collectionPointId: $collectionPointId) {
      id
      tenant_id
      name
      alias_name
      active
      customer_type_id
    }
  }
`;
export const getAllSupplierByCPId = gql`
  query getAllSupplierByCPId($CollectionPointId: Int!, $page: Int, $perPage: Int) {
    getAllSupplierByCPId(CollectionPointId: $CollectionPointId, page: $page, perPage: $perPage) {
      supplier_list {
        customer {
          name
          alias_name
        }
        tenant {
          id
          logo
          tenant {
            name
          }
        }
        active
      }
      total_page
      total_rows
    }
  }
`;
export const linkCollectionPointSupplier = gql`
  mutation linkCollectionPointSupplier($collectionPointId: Int!, $supplierId: Int!) {
    linkCollectionPointSupplier(collectionPointId: $collectionPointId, supplierId: $supplierId)
  }
`;
export const unLinkCollectionPointSupplier = gql`
  mutation unLinkCollectionPointSupplier($collectionPointId: Int!, $supplierId: Int!) {
    unLinkCollectionPointSupplier(collectionPointId: $collectionPointId, supplierId: $supplierId)
  }
`;
