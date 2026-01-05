import 'package:mobile/core/api_client.dart';
import 'package:mobile/core/services/token_storage_service.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final TokenStorageService _tokenStorage;

  AuthRepository(this._apiClient, this._tokenStorage);

  Future<void> login(String email, String password) async {
    final response = await _apiClient.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = response.data;
      if (data is Map<String, dynamic> && data.containsKey('access_token')) {
        await _tokenStorage.saveAccessToken(data['access_token']);
      }
    }
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
