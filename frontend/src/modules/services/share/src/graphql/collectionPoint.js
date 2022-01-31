import gql from 'graphql-tag';

export const getAvailableCollectionPointByTenant = gql`
  query getAvailableCollectionPointByTenant($tenantId: Int!) {
    getAvailableCollectionPointByTenant(tenantId: $tenantId) {
      id
      name
      alias_name
      account_number
      whatsapp_link
      hub_can_delivery
      persons {
        first_name
        last_name
        phone
      }
    }
  }
`;

export const getCollectionPointStatus = gql`
  query getCollectionPointStatus(
    $tenantId: [Int]!
    $hubId: [Int]
    $status: Int
    $page: Int
    $perPage: Int
    $keyword: String
  ) {
    getCollectionPointStatus(
      tenantId: $tenantId
      hubId: $hubId
      status: $status
      page: $page
      perPage: $perPage
      keyword: $keyword
    ) {
      CollectionPointStatusHeader {
        collection_point_name
        supplier
        total_buyer
        total_Purchase
        minimum_order
        completion
        delivery_date
        details {
          sku
          pooling
          quantity
          in_progress
          outstanding
          buyer_info {
            full_name
            mobile
            total_order
            total_price
            pooling_status
          }
        }
      }
      total_rows
      total_page
    }
  }
`;
