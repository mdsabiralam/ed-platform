import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// Import all the created screen files
import 'features/auth/screens/common_screens.dart';
import 'features/teacher/screens/teacher_dashboard.dart';
import 'features/teacher/screens/attendance_screen.dart';
import 'features/teacher/screens/homework_screen.dart';
import 'features/teacher/screens/teacher_profile_screen.dart';
import 'features/teacher/screens/exam_screen.dart';
import 'features/teacher/screens/leave_screen.dart';
import 'features/student/screens/student_dashboard.dart';
import 'features/student/screens/diary_screen.dart';
import 'features/student/screens/routine_screen.dart';
import 'features/student/screens/result_screen.dart';
import 'features/student/screens/library_screen.dart';
import 'features/student/screens/fee_payment_screen.dart';
import 'features/parent/screens/parent_dashboard.dart';
import 'features/parent/screens/child_switcher_screen.dart';
import 'features/parent/screens/fee_history_screen.dart';
import 'features/parent/screens/payment_gateway_screen.dart';
import 'features/driver/screens/driver_dashboard.dart';
import 'features/admin/screens/admin_dashboard.dart';
import 'features/admin/screens/staff_list_screen.dart';
import 'features/admin/screens/student_list_screen.dart';

void main() {
  runApp(const MyApp());
}

// 1. GoRouter configuration
final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: [
    // Common Routes
    GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/profile-select',
      builder: (context, state) => const ProfileSelectionScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationScreen(),
    ),

    // Teacher Routes
    GoRoute(
      path: '/teacher-dashboard',
      builder: (context, state) => const TeacherDashboardScreen(),
    ),
    GoRoute(
      path: '/teacher',
      builder: (context, state) => const TeacherDashboardScreen(),
      routes: [
        GoRoute(
          path: 'profile',
          builder: (context, state) => const TeacherProfileScreen(),
        ),
        GoRoute(
          path: 'attendance',
          builder: (context, state) => const TeacherAttendanceScreen(),
        ),
        GoRoute(
          path: 'homework',
          builder: (context, state) =>
              const TeacherHomeworkScreen(), // Placeholder
        ),
        GoRoute(
          path: 'exam',
          builder: (context, state) => const TeacherExamScreen(), // Placeholder
        ),
        GoRoute(
          path: 'leave',
          builder: (context, state) =>
              const TeacherLeaveScreen(), // Placeholder
        ),
      ],
    ),

    // Student Routes
    GoRoute(
      path: '/student-dashboard',
      builder: (context, state) => const StudentDashboardScreen(),
    ),
    GoRoute(
      path: '/student',
      builder: (context, state) => const StudentDashboardScreen(),
      routes: [
        GoRoute(
          path: 'diary',
          builder: (context, state) =>
              const StudentDiaryScreen(), // Placeholder
        ),
        GoRoute(
          path: 'routine',
          builder: (context, state) =>
              const StudentRoutineScreen(), // Placeholder
        ),
        GoRoute(
          path: 'result',
          builder: (context, state) =>
              const StudentResultScreen(), // Placeholder
        ),
        GoRoute(
          path: 'library',
          builder: (context, state) =>
              const StudentLibraryScreen(), // Placeholder
        ),
        GoRoute(
          path: 'fee-payment',
          builder: (context, state) =>
              const StudentFeePaymentScreen(), // Placeholder
        ),
      ],
    ),

    // Parent Routes
    GoRoute(
      path: '/parent-dashboard',
      builder: (context, state) => const ParentDashboardScreen(),
    ),
    GoRoute(
      path: '/parent',
      builder: (context, state) => const ParentDashboardScreen(),
      routes: [
        GoRoute(
          path: 'child-switcher',
          builder: (context, state) =>
              const ParentChildSwitcherScreen(), // Placeholder
        ),
        GoRoute(
          path: 'fee-history',
          builder: (context, state) =>
              const ParentFeeHistoryScreen(), // Placeholder
        ),
        GoRoute(
          path: 'vehicle-tracking',
          builder: (context, state) =>
              const ParentVehicleTrackingScreen(), // Placeholder
        ),
        GoRoute(
          path: 'payment-gateway',
          builder: (context, state) => const ParentPaymentGatewayScreen(),
        ),
      ],
    ),

    // Admin Routes
    GoRoute(
      path: '/admin-dashboard',
      builder: (context, state) => const AdminDashboardScreen(),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardScreen(),
      routes: [
        GoRoute(
          path: 'staff-list',
          builder: (context, state) =>
              const AdminStaffListScreen(), // Placeholder
        ),
        GoRoute(
          path: 'student-list',
          builder: (context, state) =>
              const AdminStudentListScreen(), // Placeholder
        ),
      ],
    ),

    // Driver Routes
    GoRoute(
      path: '/driver-dashboard',
      builder: (context, state) => const DriverTripDashboardScreen(),
    ),
    GoRoute(
      path: '/driver',
      builder: (context, state) => const DriverTripDashboardScreen(),
      routes: [
        GoRoute(
          path: 'passenger-list',
          builder: (context, state) =>
              const DriverPassengerListScreen(), // Placeholder
        ),
      ],
    ),

    // Librarian Routes
    GoRoute(
      path: '/library-dashboard',
      builder: (context, state) =>
          const LibrarianBookListScreen(), // Placeholder
    ),
    GoRoute(
      path: '/library',
      builder: (context, state) =>
          const LibrarianBookListScreen(), // Placeholder
      routes: [
        GoRoute(
          path: 'issue-return',
          builder: (context, state) =>
              const LibrarianIssueReturnScreen(), // Placeholder
        ),
      ],
    ),

    // Nurse Routes
    GoRoute(
      path: '/health-dashboard',
      builder: (context, state) =>
          const NurseHealthDashboardScreen(), // Placeholder
    ),
    GoRoute(
      path: '/health',
      builder: (context, state) =>
          const NurseHealthDashboardScreen(), // Placeholder
      routes: [
        GoRoute(
          path: 'opd-entry',
          builder: (context, state) =>
              const NurseOpdEntryScreen(), // Placeholder
        ),
      ],
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Ed Super App',
      theme: ThemeData(
        primarySwatch: Colors.teal,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      routerConfig: _router,
    );
  }
}

// Driver
class DriverPassengerListScreen extends StatelessWidget {
  const DriverPassengerListScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Driver Passenger List')));
}

// Librarian
class LibrarianBookListScreen extends StatelessWidget {
  const LibrarianBookListScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Librarian Book List')));
}

class LibrarianIssueReturnScreen extends StatelessWidget {
  const LibrarianIssueReturnScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Librarian Issue/Return')));
}

// Nurse
class NurseHealthDashboardScreen extends StatelessWidget {
  const NurseHealthDashboardScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Nurse Health Dashboard')));
}

class NurseOpdEntryScreen extends StatelessWidget {
  const NurseOpdEntryScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Nurse OPD Entry')));
}

class ParentVehicleTrackingScreen extends StatelessWidget {
  const ParentVehicleTrackingScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Parent Vehicle Tracking')));
}
