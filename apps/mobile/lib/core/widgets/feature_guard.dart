import 'package:flutter/material.dart';
import 'package:mobile/core/services/remote_config_service.dart';

class FeatureGuard extends StatelessWidget {
  final String flagKey;
  final Widget child;
  final Widget fallback;

  const FeatureGuard({
    super.key,
    required this.flagKey,
    required this.child,
    this.fallback = const SizedBox.shrink(),
  });

  @override
  Widget build(BuildContext context) {
    // We assume RemoteConfig is initialized at app startup.
    final isEnabled = RemoteConfigService.instance.getBool(flagKey);

    if (isEnabled) {
      return child;
    }
    return fallback;
  }
}
