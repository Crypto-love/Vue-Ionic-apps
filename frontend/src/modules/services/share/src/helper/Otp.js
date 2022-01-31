import { Platform } from 'quasar';

export class Otp {
  enableOtpListener = () => {
    try {
      if (Platform.is.android) {
        window.NativeHandler.enableOtpListener();
      }
    } catch (err) {}
  };

  disableOtpListener = () => {
    try {
      if (Platform.is.android) {
        window.NativeHandler.disableOtpListener();
      }
    } catch (err) {}
  };
}
