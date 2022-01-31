import gql from 'graphql-tag';

export const getGroupBuyProducts = gql`
  query getGroupBuyProducts($hubId: Int, $countryId: Int!) {
    getGroupBuyProducts(hubId: $hubId, countryId: $countryId) {
      id
      tenant_id
      tenant {
        tax_rate
        tenant {
          name
        }
      }
      category_id
      name
      image
      discount
      voucherify_id
      active
      category {
        id
        main_category_id
        sub_category_id
        active
        mainCategory {
          id
          name
          description
          active
        }
        subCategory {
          id
          name
          description
          active
        }
      }
      skus {
        id
        name
        product_id
        voucherify_sku_id
        is_order_by_weight
        name
        vendor_code
        is_sample
        is_b2c_pooling
        alias
        halal
        perishable
        oom_id
        unit_per_oom
        increment_qty
        weight
        price
        market_unit_price
        total_price
        total_market_price
        tax_rate
        uom {
          name
        }
        b2c_uom {
          name
        }
        b2c_oom {
          name
        }
        image
        specs
        country_of_origin
        description
        is_slack_notifiable
        active
        b2c
        b2c_unit_price
        b2c_unit_per_oom
        inventories {
          quantity
        }
      }
    }
  }
`;

export const changeGBCollectionPoint = gql`
  mutation changeGBCollectionPoint($orderId: Int!, $newSpreeId: Int!, $appMode: String!) {
    changeGBCollectionPoint(orderId: $orderId, newSpreeId: $newSpreeId, appMode: $appMode) {
      id
      spree_id
      delivery_date
      close_date
      pre_order_item {
        id
        hub {
          id
          name
          alias_name
        }
      }
    }
  }
`;
