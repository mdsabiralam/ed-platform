import 'package:mobile/core/api_client.dart';
import 'notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<List<NotificationModel>> fetchNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    // In a real app, use _apiClient.dio.get(...)
    // Simulating API delay and response
    await Future.delayed(const Duration(seconds: 1));

    return List.generate(limit, (index) {
      final actualIndex = (page - 1) * limit + index;
      return NotificationModel(
        id: 'notif_$actualIndex',
        title: 'Notification $actualIndex',
        body: 'This is the body of notification $actualIndex.',
        timestamp: DateTime.now().subtract(Duration(minutes: actualIndex * 15)),
        isRead: index % 3 == 0,
        type: NotificationType.values[index % NotificationType.values.length],
        targetRoute: _getTargetRoute(
          NotificationType.values[index % NotificationType.values.length],
        ),
      );
    });
  }

  String? _getTargetRoute(NotificationType type) {
    switch (type) {
      case NotificationType.HOMEWORK:
        return '/student/homework_details';
      case NotificationType.FEE:
        return '/parent/fee_payment';
      default:
        return null;
    }
  }

  Future<void> markAsRead(String id) async {
    // await _apiClient.dio.post('/notifications/$id/read');
    await Future.delayed(const Duration(milliseconds: 300));
  }

  Future<void> deleteNotification(String id) async {
    // await _apiClient.dio.delete('/notifications/$id');
    await Future.delayed(const Duration(milliseconds: 300));
  }
}
