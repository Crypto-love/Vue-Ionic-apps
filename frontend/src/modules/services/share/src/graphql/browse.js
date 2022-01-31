import gql from 'graphql-tag';

export const queryAllCateGories = gql`
  query categories($active: Boolean) {
    categories(active: $active) {
      active
      description
      id
      name
      image
      subCategory {
        active
        description
        id
        name
      }
    }
  }
`;
//, $page: Int, $perPage: Int, $tenantCustomerId: Int
//, page: $page, perPage: $perPage, tenantCustomerId: $tenantCustomerId
export const queryProducts = gql`
  query products(
    $active: Boolean
    $buyerId: Int
    $mainCategory: Int
    $subCategory: Int
    $page: Int
    $perPage: Int
    $hubId: Int
    $tenantCustomerId: Int
  ) {
    products(
      active: $active
      buyerId: $buyerId
      mainCategory: $mainCategory
      subCategory: $subCategory
      page: $page
      perPage: $perPage
      hubId: $hubId
      tenantCustomerId: $tenantCustomerId
    ) {
      active
      id
      image
      name
      tenant {
        tax_rate
        tenant {
          name
        }
      }
      skus {
        is_b2c_pooling
        price
        b2c_unit_price
        b2c_oom {
          name
        }
        active
        halal
        tax_rate
        b2c_unit_per_oom
        b2c_market_unit_price
        b2c_unit_price
        inventories {
          price
          quantity
        }
      }
    }
  }
`;

export const searchProducts = gql`
  query searchProducts($keyword: String!) {
    searchProducts(keyword: $keyword) {
      active
      category_id
      created_at
      id
      image
      name
      skus {
        active
        b2c_unit_per_oom
        b2c_unit_price
        b2c_market_unit_price
        is_b2c_pooling
        price
        halal
        inventories {
          price
          quantity
        }
        b2c
        oom {
          name
        }
        uom {
          name
        }
        sku_deals {
          id
          quantity
          discount
        }
        market_unit_price
        name
        is_order_by_weight
        active
        weight
        tax_rate
      }
      tenant_id
      updated_at
      voucherify_id
      tenant {
        tax_rate
        tenant {
          name
        }
      }
    }
  }
`;
