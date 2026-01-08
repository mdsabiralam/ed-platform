enum ClassStatus {
  scheduled,
  active,
  completed,
  cancelled
}

class School {
  final String id;
  final String name;
  final List<ClassSession> timeline;

  School({required this.id, required this.name, required this.timeline});
}

class ClassSession {
  final String id;
  final String className;
  final String teacherName;
  final String subject;
  final DateTime startTime;
  final DateTime endTime;
  final ClassStatus status;
  final bool hasConciergeRequest;
  final int submittedCount;
  final int totalStudents;

  ClassSession({
    required this.id,
    required this.className,
    required this.teacherName,
    required this.subject,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.hasConciergeRequest = false,
    this.submittedCount = 0,
    this.totalStudents = 30,
  });

  bool get isActive {
    final now = DateTime.now();
    return now.isAfter(startTime) && now.isBefore(endTime);
  }

  Duration get timeRemaining {
    return endTime.difference(DateTime.now());
  }
}
