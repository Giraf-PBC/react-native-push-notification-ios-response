import { NativeModules } from "react-native";

const { GPushNotificationIOSResponse } = NativeModules;

export default GPushNotificationIOSResponse;



import {NativeEventEmitter, NativeModules} from 'react-native';
import invariant from 'invariant';

const {RNCPushNotificationIOS} = NativeModules;

const PushNotificationEmitter = new NativeEventEmitter(RNCPushNotificationIOS);

const _notifHandlers = new Map();

const DEVICE_NOTIF_EVENT = 'remoteNotificationReceived';

/**
 * An event emitted by PushNotificationIOS.
 */
export type PushNotificationEventName = $Keys<{
  /**
   * Fired when a remote notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  notification: string,
  /**
   * Fired when a local notification is received. The handler will be invoked
   * with an instance of `PushNotificationIOS`.
   */
  localNotification: string,
  /**
   * Fired when the user registers for remote notifications. The handler will be
   * invoked with a hex string representing the deviceToken.
   */
  register: string,
  /**
   * Fired when the user fails to register for remote notifications. Typically
   * occurs when APNS is having issues, or the device is a simulator. The
   * handler will be invoked with {message: string, code: number, details: any}.
   */
  registrationError: string,
}>;

/**
 *
 * Handle push notifications for your app, including permission handling and
 * icon badge number.
 *
 * See https://facebook.github.io/react-native/docs/pushnotificationios.html
 */
class PushNotificationIOS {
  _data: Object;
  _alert: string | Object;
  _notificationId: string;
  _isRemote: boolean;
  _remoteNotificationCompleteCallbackCalled: boolean;
  _threadID: string;

  /**
   * Attaches a listener to remote or local notification events while the app
   * is running in the foreground or the background.
   *
   * See https://facebook.github.io/react-native/docs/pushnotificationios.html#addeventlistener
   */
  static addEventListener(type: PushNotificationEventName, handler: Function) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    let listener;
    if (type === 'notification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_NOTIF_EVENT,
        notifData => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'localNotification') {
      listener = PushNotificationEmitter.addListener(
        DEVICE_LOCAL_NOTIF_EVENT,
        notifData => {
          handler(new PushNotificationIOS(notifData));
        },
      );
    } else if (type === 'register') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTER_EVENT,
        registrationInfo => {
          handler(registrationInfo.deviceToken);
        },
      );
    } else if (type === 'registrationError') {
      listener = PushNotificationEmitter.addListener(
        NOTIF_REGISTRATION_ERROR_EVENT,
        errorInfo => {
          handler(errorInfo);
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
    type: PushNotificationEventName,
    handler: Function,
  ) {
    invariant(
      type === 'notification' ||
        type === 'register' ||
        type === 'registrationError' ||
        type === 'localNotification',
      'PushNotificationIOS only supports `notification`, `register`, `registrationError`, and `localNotification` events',
    );
    const listener = _notifHandlers.get(type);
    if (!listener) {
      return;
    }
    listener.remove();
    _notifHandlers.delete(type);
  }

  /**
   * You will never need to instantiate `PushNotificationIOS` yourself.
   * Listening to the `notification` event and invoking
   * `getInitialNotification` is sufficient
   *
   */
  constructor(nativeNotif: Object) {
    this._data = {};
    this._remoteNotificationCompleteCallbackCalled = false;
    this._isRemote = nativeNotif.remote;
    if (this._isRemote) {
      this._notificationId = nativeNotif.notificationId;
    }

    if (nativeNotif.remote) {
      // Extract data from Apple's `aps` dict as defined:
      // https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html
      Object.keys(nativeNotif).forEach(notifKey => {
        const notifVal = nativeNotif[notifKey];
        if (notifKey === 'aps') {
          this._alert = notifVal.alert;
          this._sound = notifVal.sound;
          this._badgeCount = notifVal.badge;
          this._category = notifVal.category;
          this._contentAvailable = notifVal['content-available'];
          this._threadID = notifVal['thread-id'];
        } else {
          this._data[notifKey] = notifVal;
        }
      });
    } else {
      // Local notifications aren't being sent down with `aps` dict.
      this._badgeCount = nativeNotif.applicationIconBadgeNumber;
      this._sound = nativeNotif.soundName;
      this._alert = nativeNotif.alertBody;
      this._data = nativeNotif.userInfo;
      this._category = nativeNotif.category;
    }
  }

  /**
   * This method is available for remote notifications that have been received via:
   * `application:didReceiveRemoteNotification:fetchCompletionHandler:`
   *
   * See https://facebook.github.io/react-native/docs/pushnotificationios.html#finish
   */
  finish(fetchResult: string) {
    if (
      !this._isRemote ||
      !this._notificationId ||
      this._remoteNotificationCompleteCallbackCalled
    ) {
      return;
    }
    this._remoteNotificationCompleteCallbackCalled = true;

    RNCPushNotificationIOS.onFinishRemoteNotification(
      this._notificationId,
      fetchResult,
    );
  }
}

export default PushNotificationIOS;
