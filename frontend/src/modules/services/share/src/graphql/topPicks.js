import gql from 'graphql-tag';

export const getPopularProducts = gql`
  query getPopularProducts($collection_point: Int, $countryId: Int!) {
    getPopularProducts(collection_point: $collection_point, countryId: $countryId) {
      id
      name
      image
      discount
      active
      tenant {
        tax_rate
        tenant {
          name
        }
      }
      category {
        mainCategory {
          id
          name
        }
        subCategory {
          id
          name
        }
      }
      skus {
        id
        name
        price
        alias
        halal
        specs
        country_of_origin
        total_price
        total_market_price
        b2c
        is_b2c_pooling
        b2c_unit_price
        b2c_total_price
        b2c_total_market_price
        b2c_market_unit_price
        b2c_unit_per_oom
        b2c_pooling_qty
        b2c_packaging
        tax_rate
        inventories {
          price
          quantity
        }
        sku_deals {
          discount
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
      }
    }
  }
`;
