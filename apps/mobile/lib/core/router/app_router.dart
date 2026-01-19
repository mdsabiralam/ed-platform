import 'package:go_router/go_router.dart';
import '../../features/common/screens/notification_list_screen.dart';
import '../../features/communication/screens/notice_board_screen.dart';
import '../../features/communication/screens/chat_list_screen.dart';
import '../../features/communication/screens/chat_screen.dart';
import '../../features/gallery/screens/gallery_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationListScreen(),
    ),
    GoRoute(
      path: '/notices',
      builder: (context, state) => const NoticeBoardScreen(isAdmin: true), // Defaulting to Admin for demo
    ),
    GoRoute(
      path: '/chat',
      builder: (context, state) => const ChatListScreen(),
    ),
    GoRoute(
      path: '/chat/details',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return ChatScreen(chatName: extra?['name'] ?? 'Chat');
      },
    ),
    GoRoute(
      path: '/gallery',
      builder: (context, state) => const GalleryScreen(),
    ),
  ],
);
