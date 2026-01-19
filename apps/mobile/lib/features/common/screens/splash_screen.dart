import 'dart:async';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:shared_preferences/shared_preferences.dart';

// NOTE: Please run 'flutter pub get' in your terminal to install the `flutter_animate` package.
// NOTE: Ensure you have 'assets/images/logo_white.png' in your project.

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _startNavigation();
  }

  Future<void> _startNavigation() async {
    // Platform-specific delay for branding showcase
    final int delaySeconds = kIsWeb ? 0 : 2;

    await Future.delayed(Duration(seconds: delaySeconds));
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    // This is a placeholder for your actual auth logic.
    // For production, prefer a secure storage solution like flutter_secure_storage.
    final prefs = await SharedPreferences.getInstance();
    final String? accessToken = prefs.getString('accessToken');

    if (!mounted) return; // Check if the widget is still in the widget tree.

    // Optional: Check for first-time app open to show an OnboardingScreen.
    // final bool isFirstTime = prefs.getBool('isFirstTime') ?? true;
    // if (isFirstTime) {
    //   await prefs.setBool('isFirstTime', false);
    //   Navigator.pushReplacementNamed(context, '/onboarding');
    //   return;
    // }

    if (accessToken != null && accessToken.isNotEmpty) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    const String version = '1.0.0'; // App version

    return Scaffold(
      backgroundColor: const Color(0xFF0D47A1), // Branding Primary Color: Deep Blue
      body: Stack(
        children: [
          Center(
            child: Animate(
              effects: const [
                ScaleEffect(
                  duration: Duration(milliseconds: 800),
                  curve: Curves.easeInOut,
                ),
                FadeEffect(
                  duration: Duration(milliseconds: 800),
                  curve: Curves.easeInOut,
                ),
              ],
              child: Image.asset(
                'assets/images/logo_white.png',
                height: 150,
                // Semantics for accessibility
                semanticLabel: 'Application Logo',
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Version $version',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.7),
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
