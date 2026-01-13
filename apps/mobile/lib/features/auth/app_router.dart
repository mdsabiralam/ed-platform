import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';
import 'package:mobile/features/ai_chat/ui/ai_chat_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/ai-chat/:studentId/:subjectId',
      builder: (context, state) {
        final studentId = state.pathParameters['studentId']!;
        final subjectId = state.pathParameters['subjectId']!;
        return AiChatScreen(studentId: studentId, subjectId: subjectId);
      },
    ),
  ],
);
