import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/common/screens/splash_screen.dart';

// A simple placeholder widget to avoid creating more files for missing screens.
class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({required this.title, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Placeholder for $title')),
    );
  }
}

// TODO: Replace placeholder routes with your actual screen widgets.
final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const PlaceholderScreen(title: 'Login Screen'),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const PlaceholderScreen(title: 'Dashboard Screen'),
    ),
    // TODO: Add other routes from your application here.
  ],
  // Optional: Add an error builder for handling unknown routes.
  errorBuilder: (context, state) => Scaffold(
    appBar: AppBar(title: const Text('Page Not Found')),
    body: Center(
      child: Text('The route ${state.uri} could not be found.'),
    ),
  ),
);
