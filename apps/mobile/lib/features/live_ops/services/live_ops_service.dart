import 'dart:async';
import 'dart:math';
import '../models/live_ops_models.dart';

class LiveOpsService {
  final _controller = StreamController<List<School>>.broadcast();

  Stream<List<School>> get schoolsStream => _controller.stream;

  // Mock Data
  List<School> _schools = [];

  LiveOpsService() {
    _initializeMockData();
    // Simulate real-time updates (Supabase Realtime)
    Timer.periodic(const Duration(seconds: 5), (timer) {
      _simulateUpdate();
    });
  }

  void _initializeMockData() {
    final now = DateTime.now();
    _schools = List.generate(20, (index) {
      return School(
        id: 'school-$index',
        name: 'School ${index + 1}',
        timeline: List.generate(6, (slotIndex) {
          final start = DateTime(now.year, now.month, now.day, 8 + slotIndex);
          final end = start.add(const Duration(minutes: 50));

          return ClassSession(
            id: 'session-$index-$slotIndex',
            className: 'Class ${10 - slotIndex}',
            teacherName: 'Teacher ${String.fromCharCode(65 + slotIndex)}',
            subject: ['Math', 'Physics', 'Chemistry', 'English', 'History', 'Biology'][slotIndex],
            startTime: start,
            endTime: end,
            status: _determineStatus(start, end),
            hasConciergeRequest: Random().nextBool() && slotIndex == 2, // Randomly flag some
          );
        }),
      );
    });
    _controller.add(_schools);
  }

  ClassStatus _determineStatus(DateTime start, DateTime end) {
    final now = DateTime.now();
    if (now.isAfter(end)) return ClassStatus.completed;
    if (now.isBefore(start)) return ClassStatus.scheduled;
    return ClassStatus.active;
  }

  void _simulateUpdate() {
    // Randomly trigger a concierge request on an active class
    // In real app, this would come from WebSocket
    if (_schools.isEmpty) return;

    final updatedSchools = List<School>.from(_schools);
    // Logic to update random session...
    _controller.add(updatedSchools);
  }

  void dispose() {
    _controller.close();
  }
}
