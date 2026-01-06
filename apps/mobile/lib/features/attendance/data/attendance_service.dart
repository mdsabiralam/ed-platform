import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/features/attendance/models/student.dart';

class AttendanceService {
  final String baseUrl;

  AttendanceService({required this.baseUrl});

  Future<void> submitAttendance(
      List<Student> students, String routineEntryId, DateTime date) async {
    final url = Uri.parse('$baseUrl/api/teacher/attendance/bulk');

    final body = {
      'date': date.toIso8601String(),
      'routineEntryId': routineEntryId,
      'records': students.map((s) => {
        'studentId': s.id,
        'status': s.status.toString().split('.').last, // PRESENT, ABSENT, LATE
      }).toList(),
    };

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to submit attendance: ${response.body}');
    }
  }
}
