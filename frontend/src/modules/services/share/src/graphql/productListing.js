import gql from 'graphql-tag';

export const queryProductListing = gql`
  query($product_id: Int!, $product_type_id: Int!) {
    getProductDetailB2c(product_id: $product_id, product_type_id: $product_type_id) {
      id
      name
      tax_rate
      image
      max_amount
      max_market_price
      max_price
      min_amount
      min_market_price
      min_price
      skus {
        product {
          tenant {
            tax_rate
            tenant {
              name
              alias_name
            }
          }
        }
        id
        name
        halal
        specs
        description
        country_of_origin
        image
        is_b2c_pooling
        is_order_by_weight
        image
        b2c_packaging
        b2c_pooling_qty
        b2c_increment_qty
        b2c_weight
        tax_rate
        b2c_unit_price
        b2c_market_unit_price
        b2c_unit_per_oom
        image
        b2c_oom {
          name
        }
        b2c_uom {
          name
        }
        uom {
          name
        }
        oom {
          name
        }
        b2c_oom {
          name
        }
        b2c_uom {
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
