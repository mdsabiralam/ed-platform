import 'package:mobile/core/config/app_config.dart';
import 'package:mobile/main.dart';

Future<void> main() async {
  final config = AppConfig(
    environment: Environment.dev,
    apiUrl: 'https://staging-api.school.app',
    enableDebugBanner: true,
  );
  await bootstrap(config);
}
