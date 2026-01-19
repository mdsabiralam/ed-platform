import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/notifications/data/notification_model.dart';
import 'package:mobile/features/notifications/data/notification_repository.dart';
import 'package:mobile/core/api_client.dart'; // Assuming dependency injection logic

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  // Dependencies (In a real app, use GetIt or Provider)
  late final NotificationRepository _repository;

  final List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  int _currentPage = 1;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Quick DI for this example
    _repository = NotificationRepository(ApiClient());
    _loadNotifications();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 200 &&
          !_isLoading) {
        _loadNotifications();
      }
    });
  }

  Future<void> _loadNotifications({bool refresh = false}) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
      if (refresh) {
        _notifications.clear();
        _currentPage = 1;
      }
    });

    try {
      final newItems = await _repository.fetchNotifications(page: _currentPage);
      setState(() {
        _notifications.addAll(newItems);
        _currentPage++;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load notifications: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(NotificationModel notification) async {
    if (notification.isRead) return;

    await _repository.markAsRead(notification.id);
    setState(() {
      final index = _notifications.indexWhere((n) => n.id == notification.id);
      if (index != -1) {
        _notifications[index] = _notifications[index].copyWith(isRead: true);
      }
    });
  }

  Future<void> _deleteNotification(String id) async {
    await _repository.deleteNotification(id);
    setState(() {
      _notifications.removeWhere((n) => n.id == id);
    });
  }

  void _handleNotificationTap(NotificationModel notification) {
    _markAsRead(notification);

    switch (notification.type) {
      case NotificationType.HOMEWORK:
      case NotificationType.FEE:
        if (notification.targetRoute != null) {
          // Assuming the routes exist, otherwise GoRouter might throw or show 404
          try {
            context.push(notification.targetRoute!);
          } catch (e) {
             ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Route not implemented yet')),
            );
          }
        }
        break;
      case NotificationType.NOTICE:
      case NotificationType.SYSTEM:
        _showDetailDialog(notification);
        break;
    }
  }

  void _showDetailDialog(NotificationModel notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(notification.title),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                _formatTimestamp(notification.timestamp),
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              ),
              const SizedBox(height: 10),
              Text(notification.body),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Responsive Layout
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(color: Color(0xFF1E293B))),
        actions: [
          TextButton(
            onPressed: () {
              // Mark all as read logic
              for (var n in _notifications) {
                if (!n.isRead) _markAsRead(n);
              }
            },
            child: const Text(
              'Mark All as Read',
              style: TextStyle(color: Color(0xFF0D47A1), fontWeight: FontWeight.bold),
            ),
          )
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 600) {
            // Web / Wide Screen
            return Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 600),
                child: _buildList(),
              ),
            );
          } else {
            // Mobile
            return _buildList();
          }
        },
      ),
    );
  }

  Widget _buildList() {
    return RefreshIndicator(
      onRefresh: () => _loadNotifications(refresh: true),
      child: ListView.builder(
        controller: _scrollController,
        itemCount: _notifications.length + (_isLoading ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _notifications.length) {
            return const Center(child: Padding(
              padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(),
            ));
          }

          final notification = _notifications[index];
          return Dismissible(
            key: Key(notification.id),
            direction: DismissDirection.endToStart,
            background: Container(
              color: Colors.red,
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.only(right: 20),
              child: const Icon(Icons.delete, color: Colors.white),
            ),
            onDismissed: (direction) {
              _deleteNotification(notification.id);
            },
            child: _NotificationItem(
              notification: notification,
              onTap: () => _handleNotificationTap(notification),
            ),
          );
        },
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final difference = DateTime.now().difference(timestamp);
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} mins ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}

class _NotificationItem extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const _NotificationItem({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: notification.isRead ? Colors.white : Colors.blue.shade50,
      child: ListTile(
        leading: _getIcon(notification.type),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
            color: const Color(0xFF1E293B),
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              notification.body,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              _formatTimestamp(notification.timestamp),
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _getIcon(NotificationType type) {
    switch (type) {
      case NotificationType.HOMEWORK:
        return const Icon(Icons.book, color: Colors.orange);
      case NotificationType.FEE:
        return const Icon(Icons.attach_money, color: Colors.green);
      case NotificationType.SYSTEM: // Emergency/Warning fallback for System? Or separate?
        // User asked: "Warning for Emergency". Assuming System covers that for now or adding Emergency later.
        // Let's use Warning for System if it implies alerts.
        return const Icon(Icons.warning, color: Colors.red);
      case NotificationType.NOTICE:
        return const Icon(Icons.notifications, color: Colors.blue);
    }
  }

  String _formatTimestamp(DateTime timestamp) {
    // Duplicate logic, but helper function inside state is not accessible here easily unless passed or static.
    // For simplicity, reusing logic.
    final difference = DateTime.now().difference(timestamp);
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} mins ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}
