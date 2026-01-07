import 'package:mobile/core/config/app_config.dart';
import 'package:mobile/main.dart';

Future<void> main() async {
  final config = AppConfig(
    environment: Environment.prod,
    apiUrl: 'https://api.school.app',
    enableDebugBanner: false,
  );
  await bootstrap(config);
}
