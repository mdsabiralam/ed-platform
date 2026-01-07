import 'package:mobile/core/config/app_config.dart';
import 'package:mobile/main.dart';

Future<void> main() async {
  final config = AppConfig(
    environment: Environment.staging,
    apiUrl: 'https://staging-api.school.app',
    enableDebugBanner: false,
  );
  await bootstrap(config);
}
