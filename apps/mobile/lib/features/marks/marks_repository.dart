import 'dart:convert';
import 'package:http/http.dart' as http;

class MarksRepository {
  final String baseUrl;
  final String tenantId;

  MarksRepository({
    this.baseUrl = 'http://localhost:3000',
    this.tenantId = 'ce58f250-8384-4af5-8c83-726746179b09', // Mock ID
  });

  Future<void> bulkUploadMarks(List<Map<String, dynamic>> marks) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/academic/marks/bulk-upload'),
      headers: {
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
      },
      body: jsonEncode(marks),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to upload marks: ${response.body}');
    }
  }
}
