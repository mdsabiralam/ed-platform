import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:async';

enum AuthStatus { unknown, authenticated, unauthenticated, subscriptionExpired }

class TokenStorageService {
  final FlutterSecureStorage _storage;
  final _statusController = StreamController<AuthStatus>.broadcast();

  TokenStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _lastProfileIdKey = 'last_profile_id';

  Stream<AuthStatus> get status => _statusController.stream;

  Future<void> saveAccessToken(String token) async {
    await _storage.write(key: _accessTokenKey, value: token);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    _statusController.add(AuthStatus.unauthenticated);
  }

  Future<void> saveLastProfileId(String profileId) async {
    await _storage.write(key: _lastProfileIdKey, value: profileId);
  }

  Future<String?> getLastProfileId() async {
    return await _storage.read(key: _lastProfileIdKey);
  }

  void notifySubscriptionExpired() {
    _statusController.add(AuthStatus.subscriptionExpired);
  }

  void dispose() {
    _statusController.close();
  }
}
