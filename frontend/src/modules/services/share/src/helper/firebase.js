import { Platform } from 'quasar';
import { env } from 'src/config';

export class Firebase {
  isAvailable = () => {
    /**
     * It will not throw an error if App is accessed from mobile app (not in browser)
     */
    try {
      if (Platform.is.android) window.NativeHandler.isFirebaseAvailable();
      else window.webkit.messageHandlers.isFirebaseAvailable.postMessage({});

      return true;
    } catch (err) {
      return false;
    }
  };

  getFCMToken = (eventName) => {
    if (!eventName) return;
    try {
      if (Platform.is.android) window.NativeHandler.getFCMToken(eventName);
      else if (Platform.is.ios)
        window.webkit.messageHandlers.getFCMToken.postMessage({ eventName: eventName });
    } catch (err) {}
  };

  getAPNSToken = (eventName) => {
    if (!eventName) return;
    try {
      if (Platform.is.ios) window.webkit.messageHandlers.getAPNSToken.postMessage({ eventName: eventName });
    } catch (err) {}
  };

  /**
   * Because we are using multiple environment with different databases,
   * need to add suffix to topic so notification won't send to different environment.
   */
  subscribeTopic = (topic) => {
    try {
      if (Platform.is.android) window.NativeHandler.subscribeTopic(this.formatTopic(topic));
      else if (Platform.is.ios)
        window.webkit.messageHandlers.subscribeTopic.postMessage({
          topic: this.formatTopic(topic)
        });
    } catch (err) {}
  };

  unsubscribeTopic = (topic) => {
    try {
      if (Platform.is.android) window.NativeHandler.unsubscribeTopic(this.formatTopic(topic));
      else if (Platform.is.ios)
        window.webkit.messageHandlers.unsubscribeTopic.postMessage({
          topic: this.formatTopic(topic)
        });
    } catch (err) {}
  };

  deleteInstanceId = () => {
    try {
      if (Platform.is.android) window.NativeHandler.deleteInstanceId();
      else if (Platform.is.ios) window.webkit.messageHandlers.deleteInstanceId.postMessage('');
    } catch (err) {}
  };

  formatTopic = (topic) => {
    return `${topic}-${this.appMode()}`;
  };

  appMode = () => {
    return env || 'development';
  };
}
