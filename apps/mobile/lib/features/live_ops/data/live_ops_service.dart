import 'dart:async';
import 'dart:math';
import 'package:mobile/features/live_ops/models/school_status.dart';

class LiveOpsService {
  final StreamController<List<SchoolStatus>> _controller =
      StreamController<List<SchoolStatus>>.broadcast();
  Timer? _timer;
  List<SchoolStatus> _currentData = [];

  LiveOpsService() {
    _initializeData();
    _startSimulation();
  }

  Stream<List<SchoolStatus>> getLiveStatus() {
    return _controller.stream;
  }

  void _initializeData() {
    final now = DateTime.now();
    // Start of day (e.g., 8 AM today)
    final baseTime = DateTime(now.year, now.month, now.day, 8, 0);

    _currentData = List.generate(20, (index) {
      return SchoolStatus(
        id: 'school-$index',
        name: 'School ${index + 1}',
        slots: List.generate(6, (slotIndex) {
          final start = baseTime.add(Duration(hours: slotIndex));
          final end = start.add(const Duration(hours: 1));

          // Randomly assign active status based on current time
          SlotStatus initialStatus = SlotStatus.normal;
          if (now.isAfter(start) && now.isBefore(end)) {
            initialStatus = SlotStatus.active;
          }

          return ClassSlot(
            id: 'slot-$index-$slotIndex',
            subject: _getRandomSubject(),
            teacherName: 'Teacher ${String.fromCharCode(65 + slotIndex)}',
            startTime: start,
            endTime: end,
            status: initialStatus,
          );
        }),
      );
    });

    // Emit initial data
    _controller.add(_currentData);
  }

  String _getRandomSubject() {
    const subjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Art'];
    return subjects[Random().nextInt(subjects.length)];
  }

  void _startSimulation() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      final random = Random();

      // Randomly pick a school and a slot to update
      final schoolIndex = random.nextInt(_currentData.length);
      final slotIndex = random.nextInt(_currentData[schoolIndex].slots.length);

      final school = _currentData[schoolIndex];
      final slot = school.slots[slotIndex];

      // Only update if it's currently active or normal, simulating a request coming in
      // For demo purposes, we'll toggle between active/normal and conciergeRequested
      // but biased towards active slots getting requests

      SlotStatus newStatus = slot.status;
      String? requestStatus;

      if (slot.status == SlotStatus.conciergeRequested) {
         // Resolve it occasionally
         newStatus = SlotStatus.active;
         requestStatus = null;
      } else {
         // Create a request
         newStatus = SlotStatus.conciergeRequested;
         requestStatus = '${random.nextInt(30)}/30 submitted';
      }

      final newSlot = ClassSlot(
        id: slot.id,
        subject: slot.subject,
        teacherName: slot.teacherName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: newStatus,
        requestStatus: requestStatus,
      );

      final newSlots = List<ClassSlot>.from(school.slots);
      newSlots[slotIndex] = newSlot;

      final newSchool = SchoolStatus(
        id: school.id,
        name: school.name,
        slots: newSlots,
      );

      final newData = List<SchoolStatus>.from(_currentData);
      newData[schoolIndex] = newSchool;
      _currentData = newData;

      _controller.add(_currentData);
    });
  }

  void dispose() {
    _timer?.cancel();
    _controller.close();
  }
}
