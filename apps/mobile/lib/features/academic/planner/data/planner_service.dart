import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/features/academic/planner/models/lesson_plan.dart';

class PlannerService {
  final String baseUrl = 'http://localhost:3000'; // Should be from config

  Future<List<LessonPlan>> getPlansForDate(DateTime date) async {
    // Mock implementation for now
    // In real app, call GET /api/academic/lesson-plan?date=...
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      LessonPlan(
        id: '1',
        topic: 'Algebra Basics',
        learningOutcomes: 'Understand variables and constants',
        plannedDate: date,
        status: LessonPlanStatus.PENDING,
        resourcesUrl: ['https://youtube.com/xyz'],
      ),
      LessonPlan(
        id: '2',
        topic: 'History: World War II',
        learningOutcomes: 'Causes and effects',
        plannedDate: date,
        status: LessonPlanStatus.COMPLETED,
      ),
    ];
  }

  Future<void> markAsDone(String id) async {
    final url = Uri.parse('$baseUrl/api/academic/lesson-plan/update?id=$id');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'status': 'COMPLETED',
        'teacherId': 'teacher-uuid', // Should come from Auth context
        'sectionId': 'section-uuid', // Should come from context/selection
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to update status');
    }
  }
}
