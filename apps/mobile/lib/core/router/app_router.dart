import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/concierge/screens/staff_job_queue_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/staff/job-queue',
      builder: (context, state) => const StaffJobQueueScreen(),
    ),
    GoRoute(
      path: '/staff/workbench/:requestId',
      builder: (context, state) {
        final requestId = state.pathParameters['requestId'];
        return Scaffold(
          appBar: AppBar(title: Text('Workbench: $requestId')),
          body: const Center(child: Text('Work in progress')),
        );
      },
    ),
  ],
);
