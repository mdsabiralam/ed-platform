class ConciergeRequest {
  final String id;
  final String teacherId; // Changed from teacherName to match backend
  final String subject;
  final String instructions;
  final DateTime createdAt;
  final String status;
  final String? rawImageUrl;

  ConciergeRequest({
    required this.id,
    required this.teacherId,
    required this.subject,
    required this.instructions,
    required this.createdAt,
    required this.status,
    this.rawImageUrl,
  });

  factory ConciergeRequest.fromJson(Map<String, dynamic> json) {
    return ConciergeRequest(
      id: json['id'] as String,
      teacherId: json['teacherId'] as String, // Backend returns teacherId
      subject: json['subject'] as String,
      instructions: json['instructions'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      status: json['status'] as String,
      rawImageUrl: json['rawImageUrl'] as String?, // Backend uses camelCase
    );
  }

  // Helper for UI compatibility if needed, though we should update UI to use teacherId
  String get teacherName => teacherId;

  Duration get timeElapsed => DateTime.now().difference(createdAt);

  bool get isOverdue => timeElapsed.inHours > 2;
}
