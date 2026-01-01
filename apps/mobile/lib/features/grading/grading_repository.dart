import 'dart:convert';
import 'package:http/http.dart' as http;
import 'grading_models.dart';

class GradingRepository {
  final String baseUrl;
  final String tenantId;

  GradingRepository({
    this.baseUrl = 'http://localhost:3000',
    required this.tenantId,
  });

  Future<List<GradingScale>> getScales() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/academic/grades'),
      headers: {'x-tenant-id': tenantId},
    );

    if (response.statusCode == 200) {
      final List<dynamic> body = jsonDecode(response.body);
      return body.map((json) => GradingScale.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load scales: ${response.body}');
    }
  }

  Future<void> updateScale(GradingScale scale) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/academic/grades/update'),
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
      },
      body: jsonEncode(scale.toJson()),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to update scale: ${response.body}');
    }
  }
}
