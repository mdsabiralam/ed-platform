import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/home/dashboard_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/dashboard', // Changed for testing Voice AI
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
  ],
);
