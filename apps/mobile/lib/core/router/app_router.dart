import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/screens/login_screen.dart'; // Assuming this exists or will exist
import 'package:mobile/features/academic/attendance/attendance_screen.dart';
import 'package:mobile/features/academic/attendance/attendance_repository.dart';
import 'package:mobile/features/academic/marks/marks_entry_screen.dart';
import 'package:mobile/features/academic/student/student_diary_screen.dart';
import 'package:mobile/core/database/app_database.dart'; // Assuming DI injects this
import 'package:dio/dio.dart'; // Assuming DI

// Mock DI for now
final db = AppDatabase();
final dio = Dio();
final attendanceRepo = AttendanceRepository(db, dio);

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const LoginScreen(), // Placeholder
    ),
    GoRoute(
      path: '/attendance',
      builder: (context, state) => AttendanceScreen(repository: attendanceRepo),
    ),
    GoRoute(
      path: '/marks',
      builder: (context, state) => const MarksEntryScreen(),
    ),
    GoRoute(
      path: '/student/:id/diary',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return StudentDiaryScreen(studentId: id);
      },
    ),
  ],
);
