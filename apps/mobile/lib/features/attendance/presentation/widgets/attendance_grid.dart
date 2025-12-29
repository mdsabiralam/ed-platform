import 'package:flutter/material.dart';
import 'package:mobile/features/attendance/models/student.dart';

class AttendanceGrid extends StatefulWidget {
  final List<Student> students;
  final Function(List<Student>) onSubmit;

  const AttendanceGrid({
    Key? key,
    required this.students,
    required this.onSubmit,
  }) : super(key: key);

  @override
  State<AttendanceGrid> createState() => _AttendanceGridState();
}

class _AttendanceGridState extends State<AttendanceGrid> {
  // We keep a local reference to students to manage state changes
  // Assuming the parent passes the initial list

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(8.0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3, // Adjust based on screen size
              childAspectRatio: 1.0,
              crossAxisSpacing: 8.0,
              mainAxisSpacing: 8.0,
            ),
            itemCount: widget.students.length,
            itemBuilder: (context, index) {
              final student = widget.students[index];
              return StudentTile(
                student: student,
                onTap: () {
                  setState(() {
                    student.toggleStatus();
                  });
                },
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                 // Gather final list and submit
                 widget.onSubmit(widget.students);
              },
              child: const Text('Submit Attendance'),
            ),
          ),
        ),
      ],
    );
  }
}

class StudentTile extends StatelessWidget {
  final Student student;
  final VoidCallback onTap;

  const StudentTile({
    Key? key,
    required this.student,
    required this.onTap,
  }) : super(key: key);

  Color _getStatusColor() {
    switch (student.status) {
      case AttendanceStatus.PRESENT:
        return Colors.green[100]!;
      case AttendanceStatus.ABSENT:
        return Colors.red[100]!;
      case AttendanceStatus.LATE:
        return Colors.orange[100]!;
    }
  }

  IconData _getStatusIcon() {
    switch (student.status) {
      case AttendanceStatus.PRESENT:
        return Icons.check_circle;
      case AttendanceStatus.ABSENT:
        return Icons.cancel;
      case AttendanceStatus.LATE:
        return Icons.access_time;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: _getStatusColor(),
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(color: Colors.grey[300]!),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(_getStatusIcon(), size: 32, color: Colors.black54),
            const SizedBox(height: 8),
            Text(
              student.name,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              student.admissionNo,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
