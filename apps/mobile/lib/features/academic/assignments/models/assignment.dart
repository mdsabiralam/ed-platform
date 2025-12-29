enum AssignmentStatus { PENDING, SUBMITTED, LATE, MISSING }

class Assignment {
  final String id;
  final String title;
  final String subjectName;
  final DateTime dueDate;
  final AssignmentStatus status;
  final bool isSubmitted;

  Assignment({
    required this.id,
    required this.title,
    required this.subjectName,
    required this.dueDate,
    this.status = AssignmentStatus.PENDING,
    this.isSubmitted = false,
  });

  factory Assignment.fromJson(Map<String, dynamic> json) {
     return Assignment(
       id: json['id'],
       title: json['title'],
       subjectName: json['subject']?['name'] ?? 'Subject',
       dueDate: DateTime.parse(json['dueDate']),
       // Logic to map status from backend or calculate locally
     );
  }
}
