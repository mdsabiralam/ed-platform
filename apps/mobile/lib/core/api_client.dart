import 'package:dio/dio.dart';
import 'package:mobile/core/interceptors/auth_interceptor.dart';
import 'package:mobile/core/services/token_storage_service.dart';

class ApiClient {
  final Dio _dio = Dio();
  final TokenStorageService _tokenStorageService;

  ApiClient(this._tokenStorageService) {
    _dio.options.baseUrl = 'http://10.0.2.2:3002/api';
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    );
    _dio.interceptors.add(AuthInterceptor(_tokenStorageService));
  }

  Dio get dio => _dio;
}
