import 'package:dio/dio.dart';
import 'package:mobile/core/services/token_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final TokenStorageService _tokenStorageService;

  AuthInterceptor(this._tokenStorageService);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _tokenStorageService.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
