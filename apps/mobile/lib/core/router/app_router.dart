import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
// Fixed import path as PlanListScreen is in auth directory based on file listing
import 'package:mobile/features/auth/plan_list_screen.dart';
import 'package:mobile/features/splash/splash_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
  ],
);
