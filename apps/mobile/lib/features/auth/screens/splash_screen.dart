import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // 4. Initialize WatermelonDB (Drift) in the background
      final db = context.read<AppDatabase>();
      // Trigger a read to ensure DB is open
      // ignore: unused_local_variable
      final _ = await db.select(db.students).get();
    } catch (e) {
      debugPrint('Database init error: $e');
    }

    // 2. Check for existing accessToken
    String? accessToken;
    try {
      accessToken = await _storage.read(key: 'access_token');
    } catch (e) {
      debugPrint('Storage read error: $e');
    }

    // Artificial delay
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // 3. Navigate based on token
    if (accessToken != null) {
       context.go('/dashboard');
    } else {
       context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. Display App Logo and a loading spinner.
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.school, size: 100, color: Colors.blue),
            const SizedBox(height: 20),
            const Text('Ed Platform', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
