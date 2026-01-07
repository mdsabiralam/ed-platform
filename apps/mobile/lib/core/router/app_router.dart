import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/screens/splash_screen.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/home/screens/dashboard_screen.dart';
import 'package:mobile/features/attendance/screens/smart_attendance_screen.dart';
import 'package:mobile/features/fees/screens/fee_terminal_screen.dart';
import 'package:mobile/features/student/screens/student_profile_screen.dart';
import 'package:mobile/features/results/screens/result_viewer_screen.dart';
import 'package:mobile/features/notifications/screens/notification_screen.dart';
import 'package:mobile/features/timetable/widgets/timetable_widget.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/attendance',
      builder: (context, state) => const SmartAttendanceScreen(),
    ),
    GoRoute(
      path: '/fees',
      builder: (context, state) => const FeeTerminalScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const StudentProfileScreen(),
    ),
    GoRoute(
      path: '/results',
      builder: (context, state) => const ResultViewerScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationScreen(),
    ),
    GoRoute(
      path: '/timetable',
      builder: (context, state) => const TimetableWidget(),
    ),
  ],
);
