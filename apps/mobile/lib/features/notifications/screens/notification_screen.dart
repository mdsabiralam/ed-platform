import 'package:flutter/material.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  // Dummy data
  final List<Map<String, dynamic>> _notifications = [
    {'title': 'Bus Delayed', 'type': 'Bus', 'read': false},
    {'title': 'Math Homework Due', 'type': 'Homework', 'read': true},
    {'title': 'Fee Payment Reminder', 'type': 'Fees', 'read': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: ListView.builder(
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          final notif = _notifications[index];
          return ListTile(
            leading: Text(_getIcon(notif['type'] as String), style: const TextStyle(fontSize: 24)),
            title: Text(notif['title'] as String, style: TextStyle(fontWeight: (notif['read'] as bool) ? FontWeight.normal : FontWeight.bold)),
            tileColor: (notif['read'] as bool) ? null : Colors.blue.withOpacity(0.1),
            onTap: () {
              setState(() {
                _notifications[index]['read'] = true;
              });
            },
          );
        },
      ),
    );
  }

  String _getIcon(String type) {
    switch (type) {
      case 'Bus': return '🚌';
      case 'Homework': return '📚';
      case 'Fees': return '💰';
      default: return '🔔';
    }
  }
}
