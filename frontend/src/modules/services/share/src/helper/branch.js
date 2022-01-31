import { Platform } from 'quasar';
import * as Store from '../../../../../store/index';

export class Branch {
  /**
   * Event Documentation:
   * https://help.branch.io/developers-hub/docs/tracking-commerce-content-lifecycle-and-custom-events
   */

  getUserInfo = () => {
    const state = Store.default.state;
    return {
      user_id: state.id,
      user_full_name: `${state.first_name} ${state.last_name}`,
      user_type: state.user_type,
      user_country: state.country,
      buyer_type: state.buyer_type == 2 ? 'B2C' : 'B2B',
      customer: state.selectedCompany?.name || undefined,
      hub: state.selectedHub?.name || undefined
    };
  };

  /**
   *
   * @param {Object} payload
   */
  sendCompleteRegistrationEvent = (payload) => {
    try {
      if (Platform.is.android) window.NativeHandler.sendCompleteRegistrationEvent(JSON.stringify(payload));
      else
        window.webkit.messageHandlers.sendCompleteRegistrationEvent.postMessage({
          payload: JSON.stringify(payload)
        });
    } catch (err) {}
  };

  sendLoginWithPasswordEvent = () => {
    try {
      const payload = JSON.stringify({
        event_name: 'LOGIN_WITH_PASSWORD',
        custom_data: this.getUserInfo()
      });

      if (Platform.is.android) window.NativeHandler.sendCustomEvent(payload);
      else window.webkit.messageHandlers.sendCustomEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  sendLoginWithPhoneEvent = () => {
    try {
      const payload = JSON.stringify({
        event_name: 'LOGIN_WITH_PHONE',
        custom_data: this.getUserInfo()
      });

      if (Platform.is.android) window.NativeHandler.sendCustomEvent(payload);
      else window.webkit.messageHandlers.sendCustomEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  sendJoinHubEvent = () => {
    try {
      const payload = JSON.stringify({
        event_name: 'JOIN_HUB',
        custom_data: this.getUserInfo()
      });

      if (Platform.is.android) window.NativeHandler.sendCustomEvent(payload);
      else window.webkit.messageHandlers.sendCustomEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  sendJoinHubWhatsAppEvent = () => {
    try {
      const payload = JSON.stringify({
        event_name: 'JOIN_HUB_WHATSAPP',
        custom_data: this.getUserInfo()
      });

      if (Platform.is.android) window.NativeHandler.sendCustomEvent(payload);
      else window.webkit.messageHandlers.sendCustomEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  /**
   *
   * @param {Object} item
   */
  sendViewItemsEvent = ({ search_query, category }) => {
    try {
      const payload = JSON.stringify({
        description: 'View Products',
        search_query,
        custom_data: {
          category,
          ...this.getUserInfo()
        }
      });

      if (Platform.is.android) window.NativeHandler.sendViewItemsEvent(payload);
      else window.webkit.messageHandlers.sendViewItemsEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  /**
   *
   * @param {Object} item
   */
  sendViewItemEvent = ({ tenant, product, search_query }) => {
    try {
      const payload = JSON.stringify({
        description: 'View Product',
        search_query,
        custom_data: {
          tenant,
          product,
          ...this.getUserInfo()
        }
      });

      if (Platform.is.android) window.NativeHandler.sendViewItemEvent(payload);
      else window.webkit.messageHandlers.sendViewItemEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  /**
   *
   * @param {Object} item
   */
  sendAddToCartEvent = ({
    tenant,
    product,
    sku,
    price,
    quantity,
    search_query,
    is_order_by_weight,
    total_weight
  }) => {
    try {
      const payload = JSON.stringify({
        product,
        sku,
        price,
        quantity,
        search_query,
        currency: Store.default.state.currency_code,
        custom_data: {
          ...this.getUserInfo(),
          tenant
        },
        custom_metadata: {
          is_order_by_weight: is_order_by_weight ? 'Yes' : 'No',
          total_weight
        }
      });

      if (Platform.is.android) window.NativeHandler.sendAddToCartEvent(payload);
      else window.webkit.messageHandlers.sendAddToCartEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  /**
   *
   * @param {Object} item
   */
  sendPurchaseEvent = ({ tenant, order_id, revenue, tax, shipping, payment_method, items }) => {
    try {
      /** each item in `items` should be like this
       * {
       * 		product: 'Beef Slice',
       * 		sku: 'Frozen Beef Slice (2 KG)',
       * 		price: 340.0000,
       * 		quantity: 2,
       * 		is_order_by_weight: 0,
       * 		weight: 20,
       * }
       */
      const payload = JSON.stringify({
        transactionID: order_id,
        revenue,
        tax,
        shipping,
        currency: Store.default.state.currency_code,
        custom_data: {
          ...this.getUserInfo(),
          tenant,
          payment_method
        },
        items: items.map(({ product, sku, price, quantity, is_order_by_weight, total_weight }) => ({
          product,
          sku,
          price,
          quantity,
          custom_metadata: {
            is_order_by_weight: is_order_by_weight ? 'Yes' : 'No',
            total_weight
          }
        }))
      });

      if (Platform.is.android) window.NativeHandler.sendPurchaseEvent(payload);
      else window.webkit.messageHandlers.sendPurchaseEvent.postMessage({ payload: payload });
    } catch (err) {}
  };

  /**
   *
   * @param {Object} item
   */
  sendAddPaymentInfoEvent = ({ brand, country, funding }) => {
    try {
      const payload = JSON.stringify({
        custom_data: {
          brand,
          country,
          funding,
          ...this.getUserInfo()
        }
      });

      if (Platform.is.android) window.NativeHandler.sendAddPaymentInfoEvent(payload);
      else window.webkit.messageHandlers.sendAddPaymentInfoEvent.postMessage({ payload: payload });
    } catch (err) {}
  };
}
