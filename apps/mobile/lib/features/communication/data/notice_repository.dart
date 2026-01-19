import '../../../core/api_client.dart';
import '../models/notice_model.dart';

class NoticeRepository {
  final ApiClient _apiClient;

  NoticeRepository(this._apiClient);

  Future<List<NoticeModel>> fetchNotices() async {
    // Mocking API call
    // final response = await _apiClient.get('/communication/notice');
    // return (response.data as List).map((e) => NoticeModel.fromJson(e)).toList();

    // Returning dummy data for verification
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      NoticeModel(
        id: '1',
        title: 'Exam Schedule',
        content: 'Final exams start from Dec 10.',
        timestamp: DateTime.now(),
        isPinned: true,
        isNew: true,
        audience: 'All Students',
        attachmentUrl: 'https://example.com/schedule.pdf',
      ),
      NoticeModel(
        id: '2',
        title: 'Picnic Update',
        content: 'Class 10 picnic on Friday.',
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        isPinned: false,
        isNew: false,
        audience: 'Class 10',
      ),
    ];
  }

  Future<void> publishNotice(String title, String content, String audience, {String? filePath}) async {
    final formData = {
      'title': title,
      'content': content,
      'audience': audience,
      // 'file': filePath != null ? await MultipartFile.fromFile(filePath) : null,
    };
    await _apiClient.post('/communication/notice/publish', data: formData);
  }
}
