// Type definitions for Giraf-PBC/react-native-push-notification-ios-response
// Project: https://github.com/Giraf-PBC/react-native-push-notification-ios-response

export type PushNotificationUserInfo = {
  aps: {
    alert?: {
      title?: string
      subtitle?: string
      body?: string
    }
    badge?: number
    sound?: string
  }
}

export type PushNotification = {
  identifier: string
  date: string
  title: string | null
  subtitle: string | null
  body: string | null
  badge: number | null
  category: string | null
  'thread-id': string | null
  userInfo: PushNotificationUserInfo
}

export type PushNotificationResponse = {
  _notificationResponseCompleteCallbackCalled: boolean
  _notificationIdentifier: string
  _notification: PushNotification
  _actionIdentifier: string

  /**
   * Gets the notification response's actionIdentifier:
   * cf. https://developer.apple.com/documentation/usernotifications/unnotificationresponse/1649548-actionidentifier?language=objc.
   */
  getActionIdentifier(): string;

  /**
   * Gets the notification to which the user responded.
   */
  getNotification(): PushNotification;

  /**
   * (iOS only)
   * Signifies that notification response handling is complete.
   */
  finish(): void;
}

export type PushNotificationResponseEventName = 'notificationResponse';

/**
 * Handle push notification responses for your app.
 */
export interface PushNotificationIOSResponseStatic {
  /**
   * Attaches a listener to notification responses while the app is running in the
   * foreground or the background.
   *
   * The handler will be invoked with an instance of `PushNotificationIOSResponse`.
   *
   * The type MUST be 'notificationResponse'.
   */
  addEventListener(
    type: PushNotificationResponseEventName,
    handler: (response: PushNotificationResponse) => void,
  ): void;

  /**
   * Removes the event listener. Do this in `componentWillUnmount` to prevent
   * memory leaks
   */
  removeEventListener(
    type: PushNotificationResponseEventName,
    handler: (response: PushNotificationResponse) => void
  ): void;
}

declare const PushNotificationIOSResponse: PushNotificationIOSResponseStatic;

export default PushNotificationIOSResponse;
