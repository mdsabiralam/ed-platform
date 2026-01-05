import 'package:mobile/core/api_client.dart';
import 'package:mobile/core/models/profile.dart';
import 'package:mobile/core/services/token_storage_service.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final TokenStorageService _tokenStorage;

  AuthRepository(this._apiClient, this._tokenStorage);

  Future<List<Profile>> login(String email, String password) async {
    final response = await _apiClient.dio.post(
      '/auth/login',
      data: {
        'email': email,
        'password': password,
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = response.data;
      if (data is Map<String, dynamic>) {
        if (data.containsKey('access_token')) {
          await _tokenStorage.saveAccessToken(data['access_token']);
        }

        if (data.containsKey('profiles') && data['profiles'] is List) {
          return (data['profiles'] as List)
              .map((e) => Profile.fromJson(e))
              .toList();
        }
      }
    }
    return [];
  }

  Future<void> switchProfile(String profileId) async {
    final response = await _apiClient.dio.post(
      '/auth/switch-profile',
      data: {
        'targetProfileId': profileId,
      },
    );

    // TODO: Verify if switch-profile returns a new token and update storage if needed
    if (response.statusCode == 200 || response.statusCode == 201) {
       final data = response.data;
       if (data is Map<String, dynamic> && data.containsKey('access_token')) {
         await _tokenStorage.saveAccessToken(data['access_token']);
       }
    }
  }
}
