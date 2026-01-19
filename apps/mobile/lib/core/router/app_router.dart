import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/super_admin/screens/super_admin_dashboard_screen.dart';
import 'package:mobile/features/super_admin/screens/tenant_list_screen.dart';
import 'package:mobile/features/super_admin/screens/add_edit_tenant_screen.dart';
import 'package:mobile/features/super_admin/screens/tenant_detail_screen.dart';
import 'package:mobile/features/super_admin/screens/plan_list_screen.dart';
import 'package:mobile/features/super_admin/screens/add_edit_plan_screen.dart';
import 'package:mobile/features/super_admin/screens/user_management_screen.dart';
import 'package:mobile/features/super_admin/screens/super_admin_shell.dart';
import 'package:mobile/features/auth/login_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/super-admin',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    ShellRoute(
      builder: (context, state, child) {
        return SuperAdminShell(child: child);
      },
      routes: [
        GoRoute(
          path: '/super-admin',
          builder: (context, state) => const SuperAdminDashboardScreen(),
          routes: [
            GoRoute(
              path: 'tenants',
              builder: (context, state) => const TenantListScreen(),
              routes: [
                 GoRoute(
                  path: 'add',
                  builder: (context, state) => const AddEditTenantScreen(),
                ),
                GoRoute(
                  path: 'details/:id',
                  builder: (context, state) {
                    final id = state.pathParameters['id']!;
                    return TenantDetailScreen(tenantId: id);
                  },
                ),
                GoRoute(
                  path: 'edit/:id',
                  builder: (context, state) {
                     final id = state.pathParameters['id']!;
                     return AddEditTenantScreen(tenantId: id);
                  },
                ),
              ],
            ),
            GoRoute(
              path: 'plans',
              builder: (context, state) => const PlanListScreen(),
              routes: [
                GoRoute(
                  path: 'manage',
                  builder: (context, state) => const AddEditPlanScreen(),
                ),
                GoRoute(
                  path: 'edit/:id',
                  builder: (context, state) {
                    final id = state.pathParameters['id']!;
                    return AddEditPlanScreen(planId: id);
                  },
                ),
              ],
            ),
            GoRoute(
              path: 'users',
              builder: (context, state) => const PlatformUserManagementScreen(),
            ),
          ],
        ),
      ],
    ),
  ],
);
