import { Platform } from 'quasar';

export class CleverTap {
  isAvailable = () => {
    /**
     * It will not throw an error if App is accessed from mobile app (not in browser)
     */
    try {
      if (Platform.is.android) window.NativeHandler.isFirebaseAvailable();
      else window.webkit.messageHandlers.isFirebaseAvailable.postMessage();

      return true;
    } catch (err) {
      return false;
    }
  };

  /**
   *
   * @param {Object} payload
   */
  updateUserProfile = ({ id, first_name, last_name, email, mobile, birth_date = '', lang = '' }) => {
    try {
      const phone = mobile ? (mobile.startsWith('+') ? mobile : `+${mobile}`) : undefined;
      const fullName = `${first_name} ${last_name}`;

      const payload = JSON.stringify({
        Identity: id, // String or number
        Name: fullName, // String
        Email: email, // Email address of the user
        Phone: phone, // Phone (with the country code, starting with +)
        DOB: birth_date,
        Language: lang
      });
      if (Platform.is.android) window.NativeHandler.updateCleverTapUserProfile(payload);
      else if (Platform.is.ios)
        window.webkit.messageHandlers.updateCleverTapUserProfile.postMessage({
          payload: payload
        });
    } catch (err) {}
  };

  clearUserProfile = () => {
    try {
      if (Platform.is.android) window.NativeHandler.clearCleverTapUserProfile();
      else if (Platform.is.ios) window.webkit.messageHandlers.clearCleverTapUserProfile.postMessage('');
    } catch (err) {}
  };

  trackEvent = (eventName, eventProperties = {}) => {
    try {
      const payload = JSON.stringify(eventProperties);
      if (Platform.is.android) window.NativeHandler.trackEvent(eventName, payload);
      else if (Platform.is.ios)
        window.webkit.messageHandlers.trackEvent.postMessage({
          eventName: eventName,
          payload: payload
        });
    } catch (err) {}
  };
}
