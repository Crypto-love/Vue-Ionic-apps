import gql from 'graphql-tag';

export const allOrders = gql`
  query allOrders($hub_id: Int, $status_id: [Int]!, $user_id: Int!) {
    allOrders(active: true, hub_id: $hub_id, status_id: $status_id, user_id: $user_id) {
      id
      order_status_id
      order_status {
        name
      }
      delivery_date
      delivery_time
      created_at
      updated_at
      stripe_transaction_id
      user {
        first_name
        last_name
      }
      description
      standalone
      po_number
      active
      paymentB2c {
        discount_amount
        voucher_code
        stripe_transaction_id
      }
      pre_order_item {
        id
        order_item_status {
          id
          name
        }
        order_item_status_id
        order_id
        sku_id
        sku {
          product_id
          name
          product {
            tenant {
              tenant {
                alias_name
                name
              }
            }
            name
            image
            customers {
              name
            }
          }
          is_b2c_pooling
          b2c_pooling_qty
          image
          b2c_packaging
          oom {
            name
          }
        }
        hub {
          hub_delivery_fee
          name
          alias_name
          minimum_order
          tenant {
            street_name
            registration_number
          }
          address {
            street_number
            road
            city
            postal_code
          }
        }
        tax
        original_tax
        user_id
        customer_buyer_id
        total_price
        sale_unit_price
        total_qty
      }
      supplier {
        name
        minimum_order
      }
    }
  }
`;

export const updatePreOrderItemB2CDashboardMutation = gql`
  mutation($preOrderItemId: Int!, $newTotalQty: Int!) {
    updatePreOrderItemB2CDashboard(preOrderItemId: $preOrderItemId, newTotalQty: $newTotalQty) {
      id
      order_id
      sku_id
      product_type_id
      user_id
      driver_collect_user_id
      active
      order_item_status_id
      total_qty
      status_note
    }
  }
`;

export const cancelB2cOrder = gql`
  mutation cancelB2cOrder($id: Int!, $appMode: String!) {
    cancelB2cOrder(id: $id, appMode: $appMode) {
      id
      order_status_id
      order_status {
        name
      }
      delivery_date
      delivery_time
      created_at
      updated_at
      stripe_transaction_id
      user {
        first_name
        last_name
      }
      description
      standalone
      po_number
      active
      paymentB2c {
        id
        stripe_transaction_id
      }
      pre_order_item {
        order_item_status {
          id
          name
        }
        order_item_status_id
        order_id
        sku_id
        sku {
          product_id
          name
          product {
            name
            image
            customers {
              name
            }
          }
          is_b2c_pooling
          b2c_pooling_qty
          image
          oom {
            name
          }
        }
        hub {
          hub_delivery_fee
          name
          alias_name
          tenant {
            street_name
            registration_number
          }
        }
        tax
        original_tax
        user_id
        customer_buyer_id
        total_price
        sale_unit_price
        total_qty
      }
    }
  }
`;

export const cancelB2cOrderItem = gql`
  mutation cancelB2cOrderItem($id: Int!, $appMode: String!) {
    cancelB2cOrderItem(id: $id, appMode: $appMode) {
      id
      order_status_id
      po_number
      standalone
      delivery_date
      delivery_time
      stripe_transaction_id
      charge_date
      close_date
      payment_date
      payment_status_id
      created_at
      updated_at
      last_user_id
      description
      token
      active
      paymentB2c {
        id
        stripe_transaction_id
      }
      pre_order_item {
        id
        order_id
        sku_id
        product_type_id
        user_id
        driver_collect_user_id
        driver_delivery_user_id
        customer_buyer_id
        customer_seller_id
        group_id
        invoice_id
        amount_qty
        total_qty
        origin_unit_price
        sale_unit_price
        total_price
        tax
        discount
        original_sale_unit_price
        original_total_price
        original_tax
        sku_deal_id
        cod
        created_at
        updated_at
        last_user_id
        description
        order_item_status_id
        status_note
        active
        sku {
          name
        }
        order_item_status {
          name
        }
      }
      order_status {
        id
        name
      }
    }
  }
`;

export const b2cOrder = gql`
  query getB2COrders(
    $hubIdList: [Int]
    $tenantIdList: [Int!]
    $deliveryDate: String
    $status: String
    $orderId: Int
  ) {
    getB2COrders(
      hubIdList: $hubIdList
      tenantIdList: $tenantIdList
      deliveryDate: $deliveryDate
      status: $status
      orderId: $orderId
    ) {
      order_id
      status_id
      status
      delivery_date
      delivery_time
      order_date
      info
      user_id
      customer_buyer_id
      customer
      alias_name
      items
      prices
      taxes
      description
      standalone
      po_number
      active
      tenant_id
      tenant_name
      hub
      user_name
      mobile
      delivery_method
      delivery_fee
    }
  }
`;

export const b2cOrderList = gql`
  query getB2COrderList(
    $hubIdList: [Int]
    $tenantIdList: [Int!]
    $deliveryDate: String
    $status: String
    $orderId: Int
    $page: Int
    $perPage: Int
  ) {
    getB2COrderList(
      hubIdList: $hubIdList
      tenantIdList: $tenantIdList
      deliveryDate: $deliveryDate
      status: $status
      orderId: $orderId
      page: $page
      perPage: $perPage
    ) {
      b2c_order_list {
        order_id
        child {
          order_id
          status_id
          status
          delivery_date
          delivery_time
          order_date
          info
          user_id
          customer_buyer_id
          customer
          alias_name
          items
          prices
          taxes
          description
          standalone
          po_number
          active
          tenant_id
          tenant_name
          hub
          user_name
          mobile
          delivery_method
          delivery_fee
          paymentB2c {
            id
            order_total
            discount_amount
            voucher_code
            voucher_discount_type
            voucher_discount
            voucher_minimum_amount
            stripe_transaction_id
            status
            active
            created_date
            description
            refunded_amount
            payment_transaction_id
          }
        }
      }
      total_rows
      total_page
    }
  }
`;

export const groupBuyChangeCollectionDate = gql`
  mutation changeGBCollectionDate($newCollectionDate: String!, $orderId: Int!, $appMode: String!) {
    changeGBCollectionDate(newCollectionDate: $newCollectionDate, orderId: $orderId, appMode: $appMode) {
      id
      delivery_date
      close_date
      spree_id
      pre_order_item {
        order_id
        customer_buyer_id
        pool_item {
          pool_id
          pre_order_item_id
          qty
          user_id
        }
      }
    }
  }
`;

export const b2cOrderDetails = gql`
  query getB2COrderdetails($tenantId: Int, $orderId: Int) {
    getB2COrderdetails(tenantId: $tenantId, orderId: $orderId) {
      active
      amount_qty
      close_date
      id
      item_status
      logistic_type
      oom
      order_id
      order_item_id
      order_item_status_id
      order_status_id
      price
      price_total
      product
      quantity
      sku
      sku_id
      tax
      tax_rate
      tenant_id
    }
  }
`;

export const getOrderItemStatuses = gql`
  query getOrderItemStatuses($active: Boolean, $ids: [Int]) {
    getOrderItemStatuses(active: $active, ids: $ids) {
      id
      name
    }
  }
`;
