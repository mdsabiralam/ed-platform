class ExamSchedule {
  final String id;
  final String examName;
  final String subjectName;
  final DateTime startTime;
  final int durationMinutes;

  ExamSchedule({
    required this.id,
    required this.examName,
    required this.subjectName,
    required this.startTime,
    required this.durationMinutes,
  });

  factory ExamSchedule.fromJson(Map<String, dynamic> json) {
    return ExamSchedule(
      id: json['id'],
      examName: json['exam'] != null ? json['exam']['name'] : 'Unknown Exam',
      subjectName: json['subject'] != null ? json['subject']['name'] : 'Unknown Subject',
      startTime: DateTime.parse(json['startTime']),
      durationMinutes: json['durationMinutes'],
    );
  }
}
