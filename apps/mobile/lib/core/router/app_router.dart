import 'package:go_router/go_router.dart';
import '../../features/common/screens/notification_list_screen.dart';
// Other imports would go here

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationListScreen(),
    ),
    // ... other routes (placeholders as file didn't exist)
  ],
);
