import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio = Dio();

  ApiClient() {
    _dio.options.baseUrl = 'http://10.0.2.2:3002/api';
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    );
  }

  Dio get dio => _dio;
}