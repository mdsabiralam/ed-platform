import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';
import 'package:mobile/features/academic/training/ui/training_feedback_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/training/feedback/:attendanceId',
      builder: (context, state) {
        final attendanceId = state.pathParameters['attendanceId']!;
        final trainingTitle = state.extra as String? ?? 'Training';
        return TrainingFeedbackScreen(
          attendanceId: attendanceId,
          trainingTitle: trainingTitle,
        );
      },
    ),
  ],
);
