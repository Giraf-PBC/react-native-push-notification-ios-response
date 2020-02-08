#import "GPushNotificationIOSResponse.h"

#import <UserNotifications/UserNotifications.h>

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>

NSString *const RCTNotificationResponseReceived = @"NotificationResponseReceived";

#if !TARGET_OS_TV

@interface GPushNotificationIOSResponse ()
@property (nonatomic, strong) NSMutableDictionary *notificationResponseCallbacks;
@end

#endif //TARGET_OS_TV

@implementation GPushNotificationIOSResponse

#if !TARGET_OS_TV

/*
* Copied from RNCPushNotificationIOS.
*/
static NSDictionary *RCTFormatUNNotification(UNNotification *notification)
{
  NSMutableDictionary *formattedNotification = [NSMutableDictionary dictionary];
  UNNotificationContent *content = notification.request.content;

  formattedNotification[@"identifier"] = notification.request.identifier;

  if (notification.date) {
    NSDateFormatter *formatter = [NSDateFormatter new];
    [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
    NSString *dateString = [formatter stringFromDate:notification.date];
    formattedNotification[@"date"] = dateString;
  }

  formattedNotification[@"title"] = RCTNullIfNil(content.title);
  formattedNotification[@"body"] = RCTNullIfNil(content.body);
  formattedNotification[@"category"] = RCTNullIfNil(content.categoryIdentifier);
  formattedNotification[@"thread-id"] = RCTNullIfNil(content.threadIdentifier);
  formattedNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(content.userInfo));

  return formattedNotification;
}

static NSDictionary *RCTFormatUNNotificationResponse(UNNotificationResponse *response)
{
  NSMutableDictionary *formattedResponse = [NSMutableDictionary dictionary];

  formattedResponse[@"actionIdentifier"] = RCTNullIfNil(response.actionIdentifier);

  UNNotification *notification = response.notification;
  NSDictionary *formattedNotification = RCTFormatUNNotification(notification);
  formattedResponse[@"notification"] = formattedNotification;

  return formattedResponse;
}

#endif //TARGET_OS_TV

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

#if !TARGET_OS_TV
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleNotificationResponseReceived:)
                                               name:RCTNotificationResponseReceived
                                             object:nil];
}

- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"notificationResponseReceived"];
}

+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(GNotificationResponseCallback)completionHandler
{
  NSDictionary *userInfo = @{@"response": response, @"completionHandler": completionHandler};
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTNotificationResponseReceived
                                                      object:self
                                                    userInfo:userInfo];
}

- (void)handleNotificationResponseReceived:(NSNotification *)notification
{
  UNNotificationResponse *response = notification.userInfo[@"response"];
  GNotificationResponseCallback completionHandler = notification.userInfo[@"completionHandler"];
  NSString *notificationIdentifier = response.notification.request.identifier;
  if (completionHandler) {
    if (!self.notificationResponseCallbacks) {
      // Lazy initialization
      self.notificationResponseCallbacks = [NSMutableDictionary dictionary];
    }
    self.notificationResponseCallbacks[notificationIdentifier] = completionHandler;
  }

  NSDictionary *formattedResponse = RCTFormatUNNotificationResponse(response)

  [self sendEventWithName:@"notificationResponseReceived" body:formattedResponse];
}

RCT_EXPORT_METHOD(onFinishHandlingNotificationResponse:(NSString *)notificationIdentifier) {
  GNotificationResponseCallback completionHandler = self.notificationResponseCallbacks[notificationIdentifier];
  if (!completionHandler) {
    RCTLogError(@"There is no completion handler with notification identifier: %@", notificationIdentifier);
    return;
  }
  completionHandler();
  [self.notificationResponseCallbacks removeObjectForKey:notificationIdentifier];
}

#else //TARGET_OS_TV

- (NSArray<NSString *> *)supportedEvents
{
  return @[];
}

#endif //TARGET_OS_TV

@end
