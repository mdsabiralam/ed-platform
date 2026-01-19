import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/api_client.dart';
import '../data/notification_repository.dart';
import '../models/notification_model.dart';

class NotificationListScreen extends StatefulWidget {
  const NotificationListScreen({super.key});

  @override
  State<NotificationListScreen> createState() => _NotificationListScreenState();
}

class _NotificationListScreenState extends State<NotificationListScreen> {
  final NotificationRepository _repository = NotificationRepository(ApiClient());
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  int _currentPage = 1;
  final ScrollController _scrollController = ScrollController();

  // Colors from requirements
  final Color _primaryText = const Color(0xFF1E293B);
  final Color _dateText = const Color(0xFF64748B);
  final Color _accentColor = const Color(0xFF0D47A1);

  @override
  void initState() {
    super.initState();
    _loadNotifications();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      _loadMore();
    }
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    try {
      final data = await _repository.fetchNotifications(page: 1);
      if (mounted) {
        setState(() {
          _notifications = data;
          _isLoading = false;
          _currentPage = 1;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load notifications: $e')),
        );
      }
    }
  }

  Future<void> _loadMore() async {
    try {
      final nextPage = _currentPage + 1;
      final data = await _repository.fetchNotifications(page: nextPage);
      if (data.isNotEmpty && mounted) {
        setState(() {
          _notifications.addAll(data);
          _currentPage = nextPage;
        });
      }
    } catch (e) {
      // Handle pagination error silently or show toast
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _repository.markAllAsRead();
      setState(() {
        for (var n in _notifications) {
          n.isRead = true;
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to mark all as read')),
        );
      }
    }
  }

  Future<void> _onNotificationTap(NotificationModel notification) async {
    if (!notification.isRead) {
      try {
        await _repository.markAsRead(notification.id);
        setState(() {
          notification.isRead = true;
        });
      } catch (e) {
        // Ignore error for UX smoothness
      }
    }

    if (!mounted) return;

    // Deep Linking Logic
    switch (notification.type) {
      case NotificationType.HOMEWORK:
        context.push('/student/homework_details', extra: notification.data);
        break;
      case NotificationType.FEE:
        context.push('/parent/fee_payment');
        break;
      case NotificationType.NOTICE:
        _showNoticeDialog(notification);
        break;
      case NotificationType.SYSTEM:
      default:
        if (notification.targetRoute != null) {
          context.push(notification.targetRoute!, extra: notification.data);
        }
        break;
    }
  }

  void _showNoticeDialog(NotificationModel notification) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(notification.title),
        content: Text(notification.body),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteNotification(String id, int index) async {
    final removed = _notifications[index];
    setState(() {
      _notifications.removeAt(index);
    });

    try {
      await _repository.deleteNotification(id);
    } catch (e) {
      if (mounted) {
        setState(() {
          _notifications.insert(index, removed);
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to delete')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black),
        actions: [
          TextButton(
            onPressed: _markAllAsRead,
            child: Text(
              'Mark all as read',
              style: TextStyle(color: _accentColor, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 600) {
            // Web / Tablet View
            return Center(
              child: Container(
                width: 600,
                decoration: BoxDecoration(
                  border: Border.symmetric(vertical: BorderSide(color: Colors.grey.shade200)),
                ),
                child: _buildList(),
              ),
            );
          } else {
            // Mobile View
            return RefreshIndicator(
              onRefresh: _loadNotifications,
              child: _buildList(),
            );
          }
        },
      ),
    );
  }

  Widget _buildList() {
    if (_isLoading && _notifications.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_notifications.isEmpty) {
      return const Center(child: Text('No notifications'));
    }

    return ListView.separated(
      controller: _scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: _notifications.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final notification = _notifications[index];
        return Dismissible(
          key: Key(notification.id),
          direction: DismissDirection.endToStart,
          background: Container(
            color: Colors.red,
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: const Icon(Icons.delete, color: Colors.white),
          ),
          onDismissed: (direction) {
            _deleteNotification(notification.id, index);
          },
          child: ListTile(
            tileColor: notification.isRead ? Colors.white : Colors.blue.shade50,
            leading: CircleAvatar(
              backgroundColor: Colors.grey.shade200,
              child: Icon(notification.icon, color: _primaryText),
            ),
            title: Text(
              notification.title,
              style: TextStyle(
                color: _primaryText,
                fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  notification.body,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: _primaryText.withOpacity(0.8)),
                ),
                const SizedBox(height: 4),
                Text(
                  notification.timeAgo,
                  style: TextStyle(color: _dateText, fontSize: 12),
                ),
              ],
            ),
            onTap: () => _onNotificationTap(notification),
          ),
        );
      },
    );
  }
}
