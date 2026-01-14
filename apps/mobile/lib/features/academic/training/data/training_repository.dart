import '../../../core/api_client.dart';

class TrainingRepository {
  final ApiClient _apiClient;

  TrainingRepository(this._apiClient);

  Future<void> submitFeedback({
    required String attendanceId,
    required double score,
    String? comments,
  }) async {
    await _apiClient.post(
      '/academic/training/feedback',
      data: {
        'attendanceId': attendanceId,
        'score': score.toInt(),
        'comments': comments,
      },
    );
  }
}
