import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';
import '../academic/syllabus/syllabus_viewer_screen.dart';
import '../academic/syllabus/syllabus_editor_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/syllabus/view/:planId',
      builder: (context, state) => SyllabusViewerScreen(planId: state.pathParameters['planId']!),
    ),
    GoRoute(
      path: '/syllabus/edit/:planId',
      builder: (context, state) => SyllabusEditorScreen(planId: state.pathParameters['planId']!),
    ),
  ],
);
