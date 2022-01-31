import gql from 'graphql-tag';

export const groupBuyCheckout = gql`
  mutation groupBuyCheckout(
    $userId: Int!
    $tenantId: Int!
    $hubId: Int!
    $deliveryDate: String!
    $description: String
    $voucherDiscount: String
    $voucherDiscountType: String
    $vouchercode: String
    $voucherMinimumAmount: String
    $cartItems: [GroupBuyCheckoutInputCardItem]!
  ) {
    groupBuyCheckout(
      userId: $userId
      tenantId: $tenantId
      hubId: $hubId
      deliveryDate: $deliveryDate
      description: $description
      voucherDiscount: $voucherDiscount
      voucherDiscountType: $voucherDiscountType
      vouchercode: $vouchercode
      voucherMinimumAmount: $voucherMinimumAmount
      cartItems: $cartItems
    ) {
      id
      order_status_id
      payment_status_id
    }
  }
`;
