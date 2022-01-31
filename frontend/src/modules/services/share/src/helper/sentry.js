import { Platform } from 'quasar';

export class SentryIO {
  /**
   *
   * @param {Object} payload
   */
  sendSentryException = (payload) => {
    try {
      if (Platform.is.android) window.NativeHandler.sendSentryException(JSON.stringify(payload));
      else
        window.webkit.messageHandlers.sendSentryException.postMessage({
          payload: JSON.stringify(payload)
        });
    } catch (err) {}
  };
}
