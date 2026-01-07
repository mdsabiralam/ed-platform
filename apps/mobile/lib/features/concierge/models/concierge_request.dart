class ConciergeRequest {
  final String id;
  final String teacherName;
  final String subject;
  final String instructions;
  final DateTime createdAt;
  final String status;

  ConciergeRequest({
    required this.id,
    required this.teacherName,
    required this.subject,
    required this.instructions,
    required this.createdAt,
    required this.status,
  });

  factory ConciergeRequest.fromJson(Map<String, dynamic> json) {
    return ConciergeRequest(
      id: json['id'] as String,
      teacherName: json['teacherName'] as String,
      subject: json['subject'] as String,
      instructions: json['instructions'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      status: json['status'] as String,
    );
  }

  Duration get timeElapsed => DateTime.now().difference(createdAt);

  bool get isOverdue => timeElapsed.inHours > 2;
}
