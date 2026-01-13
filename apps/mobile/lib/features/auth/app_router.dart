import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/auth/plan_list_screen.dart';
import 'package:mobile/features/exam/ui/quiz_screen.dart';
import 'package:mobile/features/exam/models/quiz_models.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/quiz',
      builder: (context, state) {
        // In a real scenario, you might pass ID and fetch, but for now passing object via extra
        final exam = state.extra as QuizExam;
        return QuizScreen(exam: exam);
      },
    ),
  ],
);
