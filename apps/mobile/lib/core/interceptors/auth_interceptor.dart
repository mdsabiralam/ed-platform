import 'package:dio/dio.dart';
import 'package:mobile/core/services/token_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final TokenStorageService _tokenStorageService;
  final Dio _dio; // Separate Dio instance for refresh calls to avoid loops

  AuthInterceptor(this._tokenStorageService)
      : _dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:3002/api'));

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

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Check if we already tried to refresh
      if (err.requestOptions.extra.containsKey('retried')) {
        await _tokenStorageService.clearTokens();
        return handler.next(err);
      }

      final refreshToken = await _tokenStorageService.getRefreshToken();
      if (refreshToken != null) {
        try {
          // Lock the interceptor/queue requests if needed (simplified here)
          // Make refresh call using separate Dio instance
          final response = await _dio.post(
            '/auth/refresh',
            data: {'refresh_token': refreshToken},
          );

          if (response.statusCode == 200 || response.statusCode == 201) {
            final newAccessToken = response.data['access_token'];
            final newRefreshToken = response.data['refresh_token']; // Optional

            await _tokenStorageService.saveAccessToken(newAccessToken);
            if (newRefreshToken != null) {
              await _tokenStorageService.saveRefreshToken(newRefreshToken);
            }

            // Retry the original request
            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccessToken';
            opts.extra['retried'] = true;

            final clonedRequest = await _dio.request(
              opts.path,
              options: Options(
                method: opts.method,
                headers: opts.headers,
                extra: opts.extra,
                contentType: opts.contentType,
                responseType: opts.responseType,
                listFormat: opts.listFormat,
                followRedirects: opts.followRedirects,
                maxRedirects: opts.maxRedirects,
                requestEncoder: opts.requestEncoder,
                responseDecoder: opts.responseDecoder,
                validateStatus: opts.validateStatus,
              ),
              data: opts.data,
              queryParameters: opts.queryParameters,
              cancelToken: opts.cancelToken,
              onReceiveProgress: opts.onReceiveProgress,
              onSendProgress: opts.onSendProgress,
            );
            return handler.resolve(clonedRequest);
          }
        } catch (e) {
          // Refresh failed
          await _tokenStorageService.clearTokens();
        }
      } else {
        await _tokenStorageService.clearTokens();
      }
    }
    handler.next(err);
  }
}
