enum Environment { dev, staging, prod }

class AppConfig {
  final Environment environment;
  final String apiUrl;
  final bool enableDebugBanner;

  static AppConfig? _instance;
  static AppConfig get instance => _instance!;

  AppConfig({
    required this.environment,
    required this.apiUrl,
    this.enableDebugBanner = true,
  }) {
    _instance = this;
  }
}
