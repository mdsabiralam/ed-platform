import 'package:dio/dio.dart';

class ApiClient {
  // Android Emulator uses 10.0.2.2 to access localhost
  // আপনার পিসির লোকাল IP ব্যবহার করুন (cmd -> ipconfig দিয়ে চেক করুন)
  // রিয়েল ডিভাইসে টেস্ট করার জন্য পিসির সঠিক IP অ্যাড্রেস জরুরি
  static const String baseUrl = 'http://192.168.127.25:3001/api/';
  final Dio _dio;

  ApiClient()
    : _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
          headers: {'Content-Type': 'application/json'},
          validateStatus: (status) =>
              true, // 404 বা 500 এরর হলেও রেসপন্স ডাটা দেখাবে, ক্র্যাশ করবে না
        ),
      )..interceptors.add(LogInterceptor(requestBody: true, responseBody: true));

  Future<Response> post(String path, {Map<String, dynamic>? data}) async {
    try {
      return await _dio.post(path, data: data);
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(path, queryParameters: queryParameters);
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }
}
