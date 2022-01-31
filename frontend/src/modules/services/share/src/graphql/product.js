import gql from 'graphql-tag';

export const getProductDetailB2c = gql`
  query getProductDetailB2c($product_id: Int!, $product_type_id: Int!) {
    getProductDetailB2c(product_id: $product_id, product_type_id: $product_type_id) {
      id
      name
      tax_rate
      max_amount
      max_market_price
      max_price
      min_amount
      min_market_price
      min_price
      skus {
        id
        name
        halal
        specs
        description
        country_of_origin
        image
        is_b2c_pooling
        b2c_pooling_qty
        b2c_increment_qty
        b2c_weight
        tax_rate
        b2c_unit_price
        b2c_unit_per_oom
        uom {
          name
        }
        oom {
          name
        }
        inventories {
          id
          customer_id
          quantity
          rank
        }
      }
    }
  }
`;

export const getSkuDeals = gql`
  query getSkuDeals($active: Boolean!, $skuId: Int) {
    getSkuDeals(active: $active, skuId: $skuId) {
      id
      sku_id
      quantity
      discount
      rank
      default
      active
    }
  }
`;

export const getB2cSkus = gql`
  query getB2cSkus($tenantId: Int!, $isPooling: Boolean) {
    getB2cSkus(tenantId: $tenantId, isPooling: $isPooling) {
      id
      name
      is_b2c_pooling
      tax_rate
      b2c_unit_per_oom
      b2c_unit_price
      b2c_pooling_qty
      b2c_packaging
      product {
        name
        tenant {
          tax_rate
        }
      }
      inventories {
        id
        quantity
        rank
      }
    }
  }
`;
