import 'package:dio/dio.dart';
import '../../../../core/api_client.dart';
import 'assignment_submission.dart';

class AssignmentRepository {
  final ApiClient _apiClient;

  AssignmentRepository(this._apiClient);

  Future<AssignmentSubmission> getSubmission(String submissionId) async {
    final response = await _apiClient.get('/academic/submission/$submissionId');
    return AssignmentSubmission.fromJson(response.data);
  }

  Future<void> saveFeedback({
    required String submissionId,
    required String teacherFeedback,
    required double obtainedMarks,
  }) async {
    await _apiClient.post(
      '/academic/submission/$submissionId/feedback',
      data: {
        'teacherFeedback': teacherFeedback,
        'obtainedMarks': obtainedMarks,
      },
    );
  }

  Future<String> uploadAudioFeedback(String submissionId, String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });

    final response = await _apiClient.post(
      '/academic/submission/$submissionId/feedback-audio',
      data: formData,
    );
    return response.data['url'];
  }

  Future<void> saveAnnotations(String submissionId, List<Map<String, dynamic>> annotations) async {
     await _apiClient.post(
      '/academic/submission/$submissionId/annotations',
      data: {
        'annotations': annotations,
      },
    );
  }

  Future<List<AssignmentSubmission>> getFeaturedSubmissions(String assignmentId) async {
    final response = await _apiClient.get('/academic/assignment/$assignmentId/featured');
    return (response.data as List)
        .map((e) => AssignmentSubmission.fromJson(e))
        .toList();
  }
}
