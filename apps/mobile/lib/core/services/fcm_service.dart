import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

// Background handler must be a top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you need to access other plugins, ensure they are initialized
  // await Firebase.initializeApp(); // Assuming Firebase is initialized in main
  print("Handling a background message: ${message.messageId}");
}

class FcmService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  String? _backendUrl;

  // Initialize FCM
  Future<void> initialize() async {
    // Request permission (iOS specifically needs this)
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
    } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
      print('User granted provisional permission');
    } else {
      print('User declined or has not accepted permission');
    }

    // Initialize Local Notifications
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // final DarwinInitializationSettings initializationSettingsDarwin =
    //     DarwinInitializationSettings(); // Use if iOS needed specific settings

    final InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      // iOS: initializationSettingsDarwin,
    );

    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
         _handleNotificationTap(response.payload);
      },
    );

    // Set Background Handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle Foreground Messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print('Message also contained a notification: ${message.notification}');
        _showLocalNotification(message);
      }
    });

    // Handle Message Open App
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('A new onMessageOpenedApp event was published!');
      _trackOpen(message.messageId);
      _handleDeepLink(message.data);
    });

    // Check if app was opened from a terminated state
    RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _trackOpen(initialMessage.messageId);
      _handleDeepLink(initialMessage.data);
    }
  }

  // Register Device Token
  Future<void> registerDevice(String userId, String backendUrl) async {
    _backendUrl = backendUrl;
    String? token = await _firebaseMessaging.getToken();
    if (token == null) return;

    print("FCM Token: $token");

    try {
      final response = await http.post(
        Uri.parse('$backendUrl/api/communication/fcm/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': token,
          'platform': Platform.isAndroid ? 'ANDROID' : 'IOS',
          'userId': userId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        print('Device registered successfully');
      } else {
        print('Failed to register device: ${response.body}');
      }
    } catch (e) {
      print('Error registering device: $e');
    }

    // Listen for token refresh
    _firebaseMessaging.onTokenRefresh.listen((newToken) async {
      // Re-register logic here
       try {
        await http.post(
          Uri.parse('$backendUrl/api/communication/fcm/register'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'token': newToken,
            'platform': Platform.isAndroid ? 'ANDROID' : 'IOS',
            'userId': userId,
          }),
        );
       } catch (e) {
         print('Error refreshing token: $e');
       }
    });
  }

  // Show Local Notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    RemoteNotification? notification = message.notification;
    AndroidNotification? android = message.notification?.android;

    if (notification != null && android != null) {
      await _localNotifications.show(
        notification.hashCode,
        notification.title,
        notification.body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            'high_importance_channel', // id
            'High Importance Notifications', // title
            channelDescription: 'This channel is used for important notifications.',
            icon: '@mipmap/ic_launcher',
          ),
        ),
        payload: jsonEncode(message.data),
      );
    }
  }

  // Deep Link Handling
  void _handleDeepLink(Map<String, dynamic> data) {
    if (data.containsKey('screen')) {
      final screen = data['screen'];
      final args = data['args'];
      print('Navigate to $screen with args $args');
      // Use GoRouter or Navigator to push screen
      // Example: router.push(screen, extra: args);
    }
  }

  void _handleNotificationTap(String? payload) {
    if (payload != null) {
      try {
        final data = jsonDecode(payload);
        if (data is Map && data.containsKey('messageId')) {
           _trackOpen(data['messageId']);
        }
        _handleDeepLink(data);
      } catch (e) {
        print("Error parsing payload: $e");
      }
    }
  }

  // Topic Subscription
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }

  Future<void> _trackOpen(String? messageId) async {
    if (messageId == null || _backendUrl == null) return;
    try {
      await http.post(
        Uri.parse('$_backendUrl/api/communication/fcm/track-open/$messageId'),
      );
      print("Tracked open for message: $messageId");
    } catch (e) {
      print("Failed to track open: $e");
    }
  }
}
