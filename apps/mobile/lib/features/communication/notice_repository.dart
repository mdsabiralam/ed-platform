import '../../core/api_client.dart';
import 'models/notice_model.dart';

class NoticeRepository {
  final ApiClient apiClient;

  NoticeRepository({required this.apiClient});

  Future<List<Notice>> getNotices() async {
    // Controller is mapped to 'communication/notices' (global prefix 'api')
    // Result: /api/communication/notices

    final response = await apiClient.dio.get('communication/notices');
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data;
      return data.map((json) => Notice.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load notices');
    }
  }

  Future<void> markAsRead() async {
     await apiClient.dio.post('communication/notices/mark-read');
  }

  Future<int> getUnreadCount() async {
    final response = await apiClient.dio.get('communication/notices/unread-count');
     if (response.statusCode == 200) {
      return response.data['count'] as int;
    }
    return 0;
  }
}
