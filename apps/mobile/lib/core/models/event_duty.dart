import 'dart:convert';

class EventDuty {
  final String id;
  final String eventId;
  final String eventName;
  final String eventLocation;
  final String roleDescription;
  final DateTime startTime;
  final DateTime endTime;
  final String status;

  EventDuty({
    required this.id,
    required this.eventId,
    required this.eventName,
    required this.eventLocation,
    required this.roleDescription,
    required this.startTime,
    required this.endTime,
    required this.status,
  });

  factory EventDuty.fromJson(Map<String, dynamic> json) {
    return EventDuty(
      id: json['id'],
      eventId: json['event']['id'],
      eventName: json['event']['name'],
      eventLocation: json['event']['location'] ?? 'Campus',
      roleDescription: json['roleDescription'],
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      status: json['status'],
    );
  }
}
