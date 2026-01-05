import 'package:mobile/core/api_client.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<void> login(String email, String password) async {
    await _apiClient.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );
  }

  Future<void> switchProfile(String profileId) async {
    await _apiClient.dio.post(
      '/auth/switch-profile',
      data: {
        'targetProfileId': profileId,
      },
    );
  }
}
