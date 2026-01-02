class AssignmentSubmission {
  final String id;
  final String assignmentId;
  final String studentId;
  final String? content;
  final String? fileUrl;
  final DateTime submittedAt;
  final String? teacherFeedback;
  final double? obtainedMarks;
  final String? audioFeedbackUrl;
  final bool isFeatured;

  AssignmentSubmission({
    required this.id,
    required this.assignmentId,
    required this.studentId,
    this.content,
    this.fileUrl,
    required this.submittedAt,
    this.teacherFeedback,
    this.obtainedMarks,
    this.audioFeedbackUrl,
    this.isFeatured = false,
  });

  factory AssignmentSubmission.fromJson(Map<String, dynamic> json) {
    return AssignmentSubmission(
      id: json['id'],
      assignmentId: json['assignmentId'],
      studentId: json['studentId'],
      content: json['content'],
      fileUrl: json['fileUrl'],
      submittedAt: DateTime.parse(json['submittedAt']),
      teacherFeedback: json['teacherFeedback'],
      obtainedMarks: json['obtainedMarks']?.toDouble(),
      audioFeedbackUrl: json['audioFeedbackUrl'],
      isFeatured: json['isFeatured'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'assignmentId': assignmentId,
      'studentId': studentId,
      'content': content,
      'fileUrl': fileUrl,
      'submittedAt': submittedAt.toIso8601String(),
      'teacherFeedback': teacherFeedback,
      'obtainedMarks': obtainedMarks,
      'audioFeedbackUrl': audioFeedbackUrl,
      'isFeatured': isFeatured,
    };
  }
}
