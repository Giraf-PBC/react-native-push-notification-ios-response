import { NativeEventEmitter, NativeModules } from 'react-native';
import invariant from 'invariant';

const { GPushNotificationIOSResponse } = NativeModules;

const PushNotificationResponseEmitter = new NativeEventEmitter(GPushNotificationIOSResponse);

const _notifHandlers = new Map();

const DEVICE_NOTIF_RESPONSE_EVENT = 'notificationResponseReceived';

/**
 *
 * Handle push notification responses for your app.
 */
class PushNotificationIOSResponse {
  /**
   * Attaches a listener to notification events while the app
   * is running in the foreground or the background.
   *
   * See https://facebook.github.io/react-native/docs/pushnotificationios.html#addeventlistener
   */
  static addEventListener(type, handler) {
    invariant(
      type === 'notificationResponse',
      'PushNotificationIOSResponse only supports the `notificationResponse` event.',
    );
    let listener;
    if (type === 'notificationResponse') {
      listener = PushNotificationResponseEmitter.addListener(
        DEVICE_NOTIF_RESPONSE_EVENT,
        notifResponseData => {
          handler(new PushNotificationIOSResponse(notifResponseData));
        },
      );
    }
    _notifHandlers.set(type, listener);
  }

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks.
   *
   * See https://facebook.github.io/react-native/docs/pushnotificationios.html#removeeventlistener
   */
  static removeEventListener(
    type,
    handler,
  ) {
    invariant(
      type === 'notificationResponse',
      'PushNotificationIOSResponse only supports the `notificationResponse` event.',
    );
    const listener = _notifHandlers.get(type);
    if (!listener) {
      return;
    }
    listener.remove();
    _notifHandlers.delete(type);
  }

  /**
   * You will never need to instantiate `PushNotificationIOSResponse` yourself.
   * Listening to the `notificationResponse` event is sufficient.
   *
   */
  constructor(nativeResponse) {
    this._notificationResponseCompleteCallbackCalled = false;
    this._notificationIdentifier = nativeResponse.notification.identifier;
    this._notification = nativeResponse.notification;
    this._actionIdentifier = nativeResponse.actionIdentifier;
  }

  /**
   * This method is available for notification responses that have been received via:
   * `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`
   */
  finish() {
    if (
      !this._notificationIdentifier ||
      this._notificationResponseCompleteCallbackCalled
    ) {
      return;
    }
    this._notificationResponseCompleteCallbackCalled = true;

    GPushNotificationIOSResponse.onFinishHandlingNotificationResponse(
      this._notificationIdentifier,
    );
  }

  /**
   * Gets the notification response's actionIdentifier:
   * cf. https://developer.apple.com/documentation/usernotifications/unnotificationresponse/1649548-actionidentifier?language=objc.
   */
  getActionIdentifier() {
    return this._actionIdentifier;
  }

  /**
   * Gets the notification to which the user responded.
   */
  getNotification() {
    return this._notification;
  };

}

export default PushNotificationIOSResponse;
