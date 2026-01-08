enum ConciergeRequestStatus {
  PENDING,
  IN_PROGRESS,
  COMPLETED,
}

class ConciergeRequest {
  final String id;
  final String teacherName;
  final String subject;
  final String instructionText;
  final DateTime createdAt;
  final ConciergeRequestStatus status;

  ConciergeRequest({
    required this.id,
    required this.teacherName,
    required this.subject,
    required this.instructionText,
    required this.createdAt,
    required this.status,
  });
}
