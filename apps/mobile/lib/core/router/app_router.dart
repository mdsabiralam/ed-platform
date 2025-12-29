import 'package:go_router/go_router.dart';
import 'package:mobile/features/attendance/presentation/attendance_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const AttendanceScreen( // Temporarily setting home to attendance for demo/testing
        routineEntryId: 'demo-routine-id',
        className: 'Class 10 - Math',
      ),
    ),
    // We can add logic to redirect based on time/context here or in a wrapper widget
  ],
);
