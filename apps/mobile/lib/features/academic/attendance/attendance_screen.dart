import 'package:flutter/material.dart';
import 'attendance_repository.dart';

class AttendanceScreen extends StatefulWidget {
  final AttendanceRepository repository;
  const AttendanceScreen({super.key, required this.repository});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  List<Map<String, dynamic>> students = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
      final list = await widget.repository.getStudents();
      setState(() {
          students = list;
          isLoading = false;
      });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Attendance')),
      body: isLoading
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
        itemCount: students.length,
        itemBuilder: (context, index) {
          final student = students[index];
          return ListTile(
            title: Text(student['name']),
            trailing: Switch(
              value: student['status'] == 'PRESENT',
              onChanged: (val) {
                setState(() {
                  students[index]['status'] = val ? 'PRESENT' : 'ABSENT';
                });
              },
              activeColor: Colors.green,
              inactiveTrackColor: Colors.red,
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _saveAttendance,
        child: const Icon(Icons.save),
      ),
    );
  }

  Future<void> _saveAttendance() async {
    final date = DateTime.now().toIso8601String();
    final records = students.map((s) => {
      'studentId': s['id'],
      'date': date,
      'status': s['status'],
    }).toList();

    await widget.repository.markAttendance(records);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Attendance Saved (Offline/Sync)')),
      );
    }
  }
}
