#import <React/RCTEventEmitter.h>

extern NSString *const NotificationResponseReceived;

@interface GPushNotificationIOSResponse : RCTEventEmitter

typedef void (^GNotificationResponseCallback)(void);

#if !TARGET_OS_TV
+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(GNotificationResponseCallback)completionHandler;
#endif

@end
