import gql from 'graphql-tag';

export const getHotDiscountProductsB2C = gql`
  query getHotDiscountProductsB2C($hubId: Int, $countryId: Int!) {
    getHotDiscountProductsB2C(hubId: $hubId, countryId: $countryId) {
      active
      category_id
      discount
      id
      image
      max_amount
      max_market_price
      max_price
      min_amount
      min_market_price
      min_price
      name
      skus {
        b2c_unit_per_oom
        b2c_unit_price
        b2c_market_unit_price
        is_b2c_pooling
        halal
        price
        inventories {
          price
          quantity
        }
        b2c
        oom {
          name
        }
        b2c_unit_per_oom
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
      tenant {
        tax_rate
        tenant {
          name
        }
      }
      tenant_id
      voucherify_id
    }
  }
`;
