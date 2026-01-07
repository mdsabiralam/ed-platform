import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/auth/plan_list_screen.dart';
import 'package:mobile/features/concierge/ui/staff_job_queue_screen.dart';
import 'package:mobile/features/concierge/ui/staff_workbench_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/concierge/queue',
      builder: (context, state) => const StaffJobQueueScreen(),
    ),
    GoRoute(
      path: '/concierge/workbench/:requestId',
      builder: (context, state) {
        final requestId = state.pathParameters['requestId']!;
        return StaffWorkbenchScreen(requestId: requestId);
      },
    ),
  ],
);
