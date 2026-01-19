import '../../../core/api_client.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final ApiClient _apiClient;

  NotificationRepository(this._apiClient);

  Future<List<NotificationModel>> fetchNotifications({int page = 1}) async {
    try {
      final response = await _apiClient.get(
        '/notifications',
        queryParameters: {'page': page, 'limit': 20},
      );

      // Assuming response.data is List or contains 'data' key with List
      final List<dynamic> list = (response.data is Map && response.data.containsKey('data'))
          ? response.data['data']
          : response.data;

      return list.map((e) => NotificationModel.fromJson(e)).toList();
    } catch (e) {
      // Return empty list or rethrow depending on error handling strategy
      // For now, let's rethrow to be handled by UI
      rethrow;
    }
  }

  Future<void> markAsRead(String id) async {
    await _apiClient.put('/notifications/$id/read', data: {});
  }

  Future<void> markAllAsRead() async {
    await _apiClient.put('/notifications/read-all', data: {});
  }

  Future<void> deleteNotification(String id) async {
    await _apiClient.delete('/notifications/$id');
  }
}
