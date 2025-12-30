import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/auth/plan_list_screen.dart';
import 'package:mobile/features/timetable/timetable_screen.dart';
import 'package:mobile/features/classroom/active_classes_screen.dart';
import 'package:mobile/core/api/api_client.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/timetable', // Temporary change to test timetable directly or stick to login
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/timetable',
      builder: (context, state) => const TimetableScreen(routine: {}), // Initially empty map
    ),
    GoRoute(
      path: '/active-classes',
      builder: (context, state) => ActiveClassesScreen(apiClient: ApiClient()),
    ),
  ],
);
