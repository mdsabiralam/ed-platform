enum AttendanceStatus { PRESENT, ABSENT, LATE }

class Student {
  final String id;
  final String name;
  final String admissionNo;
  AttendanceStatus status;
  DateTime? markedAt;

  Student({
    required this.id,
    required this.name,
    required this.admissionNo,
    this.status = AttendanceStatus.PRESENT,
    this.markedAt,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'],
      name: '${json['first_name']} ${json['last_name']}',
      admissionNo: json['admission_no'],
    );
  }

  void toggleStatus() {
    switch (status) {
      case AttendanceStatus.PRESENT:
        status = AttendanceStatus.ABSENT;
        break;
      case AttendanceStatus.ABSENT:
        status = AttendanceStatus.LATE;
        markedAt = DateTime.now(); // Prompt 3: If status is 'Late', automatically capture the current timestamp.
        break;
      case AttendanceStatus.LATE:
        status = AttendanceStatus.PRESENT;
        markedAt = null;
        break;
    }
  }
}
