import 'package:dio/dio.dart';

class ApiClient {
  // আপনার কম্পিউটারের সঠিক IP এবং Port (3000)
  static const String baseUrl = 'http://192.168.127.25:3001/api';
  final Dio _dio;

  ApiClient()
    : _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(
            seconds: 10,
          ), // কানেকশন টাইমআউট ১০ সেকেন্ড
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
        ),
      );

  Future<Response> post(String path, {Map<String, dynamic>? data}) async {
    try {
      return await _dio.post(path, data: data);
    } catch (e) {
      // বিস্তারিত এরর দেখার জন্য
      throw Exception('API Error: $e');
    }
  }

  Future<Response> get(String path) async {
    try {
      return await _dio.get(path);
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }
}
