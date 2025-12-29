import 'package:flutter/material.dart';
import 'package:mobile/features/attendance/models/student.dart';
import 'package:mobile/features/attendance/presentation/widgets/attendance_grid.dart';
import 'package:mobile/features/attendance/data/attendance_service.dart';
import 'package:mobile/features/attendance/logic/context_service.dart';

class AttendanceScreen extends StatefulWidget {
  final String routineEntryId;
  final String className;

  const AttendanceScreen({
    Key? key,
    required this.routineEntryId,
    required this.className,
  }) : super(key: key);

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  // Mock data for demonstration. In real app, fetch from API.
  List<Student> students = List.generate(
    50,
    (index) => Student(
      id: 'student-$index',
      name: 'Student ${index + 1}',
      admissionNo: 'ADM${2024000 + index}',
    ),
  );

  bool _isLoading = false;
  final AttendanceService _apiService = AttendanceService(baseUrl: 'http://localhost:3000'); // Configure env properly

  void _submitAttendance(List<Student> students) async {
    // Validation: Prevent marking attendance if the current day is a Sunday or a Holiday
    if (ContextService.isHoliday(DateTime.now())) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot mark attendance on Holidays or Sundays!')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await _apiService.submitAttendance(students, widget.routineEntryId, DateTime.now());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Attendance submitted successfully!')),
        );
        Navigator.pop(context); // Go back after success
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Attendance: ${widget.className}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : AttendanceGrid(
              students: students,
              onSubmit: _submitAttendance,
            ),
    );
  }
}
