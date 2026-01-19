import 'package:flutter/material.dart';

enum NotificationType {
  HOMEWORK,
  FEE,
  NOTICE,
  SYSTEM,
}

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final DateTime timestamp;
  bool isRead;
  final NotificationType type;
  final String? targetRoute;
  final Map<String, dynamic>? data;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.timestamp,
    this.isRead = false,
    required this.type,
    this.targetRoute,
    this.data,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isRead: json['isRead'] as bool? ?? false,
      type: _parseType(json['type'] as String?),
      targetRoute: json['targetRoute'] as String?,
      data: json['data'] as Map<String, dynamic>?,
    );
  }

  static NotificationType _parseType(String? type) {
    switch (type?.toUpperCase()) {
      case 'HOMEWORK':
        return NotificationType.HOMEWORK;
      case 'FEE':
        return NotificationType.FEE;
      case 'NOTICE':
        return NotificationType.NOTICE;
      case 'SYSTEM':
      default:
        return NotificationType.SYSTEM;
    }
  }

  String get timeAgo {
    final difference = DateTime.now().difference(timestamp);
    if (difference.inDays > 7) {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    } else if (difference.inDays >= 1) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours >= 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes >= 1) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  IconData get icon {
    switch (type) {
      case NotificationType.HOMEWORK:
        return Icons.menu_book;
      case NotificationType.FEE:
        return Icons.attach_money;
      case NotificationType.NOTICE:
        return Icons.campaign; // or warning based on requirements, but campaign fits notice better
      case NotificationType.SYSTEM:
        return Icons.notifications;
    }
  }
}
