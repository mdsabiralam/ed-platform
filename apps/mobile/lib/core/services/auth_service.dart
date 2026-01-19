import 'package:dio/dio.dart';

class AuthService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api')); // Mock base URL

  Future<Map<String, dynamic>> login(String email, String password) async {
    // Simulate API call delay
    await Future.delayed(const Duration(seconds: 2));

    // Mock logic for demo purposes (Since we don't have the real backend reachable from here easily in this context)
    if (email == 'admin@ed.com' && password == 'password') {
      return {
        'token': 'mock_token_super_admin',
        'role': 'SUPER_ADMIN',
      };
    } else if (email == 'principal@school.com' && password == 'password') {
       return {
        'token': 'mock_token_principal',
        'role': 'PRINCIPAL',
      };
    } else if (email == 'teacher@school.com' && password == 'password') {
       return {
        'token': 'mock_token_teacher',
        'role': 'TEACHER',
      };
    } else if (email == 'parent@school.com' && password == 'password') {
       return {
        'token': 'mock_token_parent',
        'role': 'PARENT',
      };
    }

    throw DioException(
      requestOptions: RequestOptions(path: '/auth/login'),
      response: Response(
        requestOptions: RequestOptions(path: '/auth/login'),
        statusCode: 401,
        statusMessage: 'Unauthorized',
      ),
      type: DioExceptionType.badResponse,
    );
  }
}
