enum SlotStatus {
  normal,
  active,
  conciergeRequested,
}

class ClassSlot {
  final String id;
  final String subject;
  final String teacherName;
  final DateTime startTime;
  final DateTime endTime;
  final SlotStatus status;
  final String? requestStatus;

  ClassSlot({
    required this.id,
    required this.subject,
    required this.teacherName,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.requestStatus,
  });

  // Helper to determine duration in minutes
  int get durationMinutes => endTime.difference(startTime).inMinutes;

  // Helper to get formatted time remaining
  String get timeRemaining {
    final now = DateTime.now();
    if (now.isBefore(startTime)) {
      return 'Starts in ${startTime.difference(now).inMinutes} mins';
    } else if (now.isAfter(endTime)) {
      return 'Ended';
    } else {
      return '${endTime.difference(now).inMinutes} mins remaining';
    }
  }
}

class SchoolStatus {
  final String id;
  final String name;
  final List<ClassSlot> slots;

  SchoolStatus({
    required this.id,
    required this.name,
    required this.slots,
  });
}
