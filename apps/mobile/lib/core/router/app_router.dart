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

// Principal & Staff
import 'package:mobile/features/principal/screens/dashboard_screen.dart';
import 'package:mobile/features/staff/screens/staff_list_screen.dart';
import 'package:mobile/features/staff/screens/add_staff_screen.dart';
import 'package:mobile/features/staff/screens/staff_profile_screen.dart';
// Student & Admission (Admin)
import 'package:mobile/features/student_management/screens/student_list_screen.dart';
import 'package:mobile/features/student_management/screens/student_profile_screen.dart';
import 'package:mobile/features/admission/screens/admission_form_screen.dart';
// Academic
import 'package:mobile/features/academic/screens/academic_setup_screen.dart';
import 'package:mobile/features/academic/screens/session_manager_screen.dart';
import 'package:mobile/features/academic/screens/timetable_screen.dart';
import 'package:mobile/features/academic/screens/homework_screen.dart';
import 'package:mobile/features/academic/screens/create_homework_screen.dart';
import 'package:mobile/features/academic/screens/homework_status_screen.dart';
import 'package:mobile/features/academic/screens/marks_entry_screen.dart';
// Finance
import 'package:mobile/features/finance/screens/fee_management_screen.dart';
import 'package:mobile/features/finance/screens/fee_dashboard_screen.dart';
import 'package:mobile/features/finance/screens/fee_payment_screen.dart'; // Student Payment
// Transport
import 'package:mobile/features/transport/screens/transport_dashboard_screen.dart';
import 'package:mobile/features/transport/screens/vehicle_list_screen.dart';
import 'package:mobile/features/transport/screens/route_management_screen.dart';
import 'package:mobile/features/transport/screens/driver_dashboard_screen.dart'; // Driver
import 'package:mobile/features/transport/screens/passenger_manifest_screen.dart'; // Driver
// Teacher
import 'package:mobile/features/teacher/screens/teacher_dashboard.dart';
import 'package:mobile/features/teacher/screens/attendance_screen.dart';
import 'package:mobile/features/teacher/screens/attendance_history_screen.dart';
// HR
import 'package:mobile/features/hr/screens/leave_application_screen.dart';
// Student View
import 'package:mobile/features/student/screens/report_card_screen.dart';
import 'package:mobile/features/student/screens/student_dashboard_screen.dart';
import 'package:mobile/features/student/screens/digital_diary_screen.dart';
import 'package:mobile/features/student/screens/student_routine_screen.dart';
// Library & AI
import 'package:mobile/features/library/screens/library_search_screen.dart';
import 'package:mobile/features/ai/screens/ai_doubt_solver_screen.dart';
// Parent
import 'package:mobile/features/parent/screens/parent_dashboard_screen.dart';
import 'package:mobile/features/parent/screens/fee_history_screen.dart';
import 'package:mobile/features/parent/screens/vehicle_tracking_screen.dart';
import 'package:mobile/features/parent/screens/student_leave_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/super-admin', // Default initial
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(),
    ),
    // Super Admin Routes
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
    // Principal Routes
    GoRoute(
      path: '/principal',
      builder: (context, state) => const PrincipalDashboardScreen(),
      routes: [
        GoRoute(
          path: 'dashboard',
          builder: (context, state) => const PrincipalDashboardScreen(),
        ),
      ],
    ),
    // Staff Routes (Admin View)
    GoRoute(
      path: '/staff',
      builder: (context, state) => const StaffListScreen(),
      routes: [
        GoRoute(
          path: 'add',
          builder: (context, state) => const AddStaffScreen(),
        ),
        GoRoute(
          path: 'profile/:id',
          builder: (context, state) {
             final id = state.pathParameters['id']!;
             return StaffProfileScreen(staffId: id);
          },
        ),
      ],
    ),
    // Student Routes (Admin View)
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentListScreen(),
      routes: [
        GoRoute(
           path: 'list',
           builder: (context, state) => const StudentListScreen(),
        ),
        GoRoute(
          path: 'admission',
          builder: (context, state) => const AdmissionFormScreen(),
        ),
        GoRoute(
          path: 'profile/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return StudentProfileScreen(studentId: id);
          },
        ),
        GoRoute(
          path: 'edit/:id',
           builder: (context, state) {
             return const AdmissionFormScreen();
           },
        ),
        // Student Portal Routes (Nested under /student for clarity in routing structure, though functionally separate)
        GoRoute(
          path: 'dashboard',
          builder: (context, state) => const StudentDashboardScreen(),
        ),
        GoRoute(
          path: 'diary',
          builder: (context, state) => const DigitalDiaryScreen(),
        ),
        GoRoute(
          path: 'routine',
          builder: (context, state) => const StudentRoutineScreen(),
        ),
      ],
    ),
    // Academic Routes (Admin View)
    GoRoute(
      path: '/academic',
      builder: (context, state) => const AcademicSetupScreen(),
      routes: [
        GoRoute(
          path: 'setup',
          builder: (context, state) => const AcademicSetupScreen(),
        ),
         GoRoute(
          path: 'sessions',
          builder: (context, state) => const SessionManagerScreen(),
        ),
         GoRoute(
          path: 'timetable',
          builder: (context, state) => const TimetableScreen(),
        ),
        // Homework Management (Admin/Teacher Shared)
        GoRoute(
          path: 'homework',
          builder: (context, state) => const HomeworkManagementScreen(),
          routes: [
            GoRoute(
              path: 'create',
              builder: (context, state) => const CreateHomeworkScreen(),
            ),
            GoRoute(
              path: 'status/:id',
              builder: (context, state) => HomeworkStatusScreen(homeworkId: state.pathParameters['id']!),
            ),
          ],
        ),
        GoRoute(
          path: 'marks/entry',
          builder: (context, state) => const MarksEntryScreen(),
        ),
      ],
    ),
    // Finance Routes
     GoRoute(
      path: '/finance',
      builder: (context, state) => const FeeDashboardScreen(),
      routes: [
         GoRoute(
          path: 'dashboard',
          builder: (context, state) => const FeeDashboardScreen(),
        ),
        GoRoute(
          path: 'collect',
          builder: (context, state) => const FeeManagementScreen(),
        ),
        GoRoute(
          path: 'pay',
          builder: (context, state) => const FeePaymentScreen(),
        ),
      ],
    ),
    // Transport Routes (Admin)
    GoRoute(
      path: '/transport',
      builder: (context, state) => const TransportDashboardScreen(),
      routes: [
        GoRoute(
          path: 'dashboard',
          builder: (context, state) => const TransportDashboardScreen(),
        ),
        GoRoute(
          path: 'vehicles',
          builder: (context, state) => const VehicleListScreen(),
        ),
         GoRoute(
          path: 'routes',
          builder: (context, state) => const RouteManagementScreen(),
        ),
      ],
    ),
    // Driver App Routes
    GoRoute(
      path: '/driver',
      builder: (context, state) => const DriverDashboardScreen(),
      routes: [
        GoRoute(
          path: 'dashboard',
          builder: (context, state) => const DriverDashboardScreen(),
        ),
        GoRoute(
          path: 'manifest',
          builder: (context, state) => const PassengerManifestScreen(),
        ),
      ],
    ),
    // Teacher Routes
    GoRoute(
      path: '/teacher',
      builder: (context, state) => const TeacherDashboardScreen(),
      routes: [
        GoRoute(
          path: 'attendance/take',
          builder: (context, state) => const AttendanceScreen(),
        ),
        GoRoute(
          path: 'attendance/history',
          builder: (context, state) => const AttendanceHistoryScreen(),
        ),
      ],
    ),
    // HR Routes
    GoRoute(
      path: '/hr',
      builder: (context, state) => const LeaveApplicationScreen(),
      routes: [
        GoRoute(
          path: 'leave',
          builder: (context, state) => const LeaveApplicationScreen(),
        ),
      ],
    ),
    // Student View Routes (Portal)
    GoRoute(
      path: '/portal',
      routes: [
        GoRoute(
          path: 'report-card',
          builder: (context, state) => const ReportCardScreen(),
        ),
      ],
    ),
    // Library
    GoRoute(
      path: '/library/search',
      builder: (context, state) => const LibrarySearchScreen(),
    ),
    // AI
    GoRoute(
      path: '/ai/chat',
      builder: (context, state) => const AiDoubtSolverScreen(),
    ),
    // Parent Portal Routes
    GoRoute(
      path: '/parent',
      builder: (context, state) => const ParentDashboardScreen(),
      routes: [
        GoRoute(
          path: 'dashboard',
          builder: (context, state) => const ParentDashboardScreen(),
        ),
        GoRoute(
          path: 'fees',
          builder: (context, state) => const FeeHistoryScreen(),
        ),
        GoRoute(
          path: 'tracking',
          builder: (context, state) => const VehicleTrackingScreen(),
        ),
        GoRoute(
          path: 'leave',
          builder: (context, state) => const StudentLeaveScreen(),
        ),
      ],
    ),
  ],
);
