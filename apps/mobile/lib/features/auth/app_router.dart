import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/saas/plan_list_screen.dart';
import '../academic/learning_resources/ui/teacher_resource_upload_screen.dart';
import '../academic/learning_resources/ui/student_library_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
      path: '/plans',
      builder: (context, state) => const PlanListScreen(),
    ),
    GoRoute(
      path: '/academic/resource/upload',
      builder: (context, state) => const TeacherResourceUploadScreen(),
    ),
    GoRoute(
      path: '/academic/library/:topicId/:topicName',
      builder: (context, state) => StudentLibraryScreen(
        topicId: state.pathParameters['topicId']!,
        topicName: state.pathParameters['topicName']!,
      ),
    ),
  ],
);
