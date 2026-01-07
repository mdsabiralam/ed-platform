import 'package:dio/dio.dart';
import '../models/marksheet_template_model.dart';

class MarksheetTemplateRepository {
  final Dio _dio;

  MarksheetTemplateRepository(this._dio);

  Future<void> saveTemplate(MarksheetTemplateConfig config) async {
    try {
      // Assuming baseUrl is configured in Dio
      await _dio.post(
        '/api/academic/template/save',
        data: config.toJson(),
      );
    } catch (e) {
      throw Exception('Failed to save template: $e');
    }
  }
}
