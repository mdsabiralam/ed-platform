import 'package:firebase_remote_config/firebase_remote_config.dart';

class RemoteConfigService {
  static final RemoteConfigService instance = RemoteConfigService._();

  RemoteConfigService._();

  final FirebaseRemoteConfig _remoteConfig = FirebaseRemoteConfig.instance;

  Future<void> initialize() async {
    await _remoteConfig.setConfigSettings(RemoteConfigSettings(
      fetchTimeout: const Duration(minutes: 1),
      minimumFetchInterval: const Duration(hours: 1),
    ));

    await _remoteConfig.setDefaults(const {
      "enable_ai_tutor": false,
    });

    try {
      await _remoteConfig.fetchAndActivate();
    } catch (e) {
      print('Remote Config fetch failed: $e');
    }
  }

  bool getBool(String key) => _remoteConfig.getBool(key);
}
