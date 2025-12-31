import 'package:dio/dio.dart';
import '../../../../core/api_client.dart';
import '../models/exam_schedule_model.dart';

class ExamRepository {
  final ApiClient apiClient;

  ExamRepository({required this.apiClient});

  Future<List<ExamSchedule>> getExamSchedules(String classId) async {
    try {
      final response = await apiClient.get(
        '/academic/exam/schedule',
        queryParameters: {'classId': classId},
      );

      // Assuming response.data is List or contains list
      // Typical structure might be List<dynamic> directly or { data: [] }
      // Based on NestJS default, it returns the array directly from findMany.

      if (response.data is List) {
        return (response.data as List)
            .map((e) => ExamSchedule.fromJson(e))
            .toList();
      } else {
        return [];
      }
    } catch (e) {
      // Handle error or rethrow
      throw Exception('Failed to load exam schedules: $e');
    }
  }
}
