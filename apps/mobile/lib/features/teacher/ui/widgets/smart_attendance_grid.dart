import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart' as drift;
import 'package:mobile/core/database/app_database.dart';
import 'package:provider/provider.dart';

enum AttendanceStatus { present, absent, late, onLeave }

class StudentAttendance {
  final String id;
  final String rollNo;
  AttendanceStatus status;

  StudentAttendance({
    required this.id,
    required this.rollNo,
    this.status = AttendanceStatus.present,
  });
}

class SmartAttendanceGrid extends StatefulWidget {
  final String classId;

  const SmartAttendanceGrid({Key? key, required this.classId}) : super(key: key);

  @override
  State<SmartAttendanceGrid> createState() => _SmartAttendanceGridState();
}

class _SmartAttendanceGridState extends State<SmartAttendanceGrid> {
  List<StudentAttendance> _students = [];
  bool _isLoading = true;
  bool _isOffline = false;

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
    final connectivityResult = await (Connectivity().checkConnectivity());
    setState(() {
      _isOffline = connectivityResult == ConnectivityResult.none;
    });

    final db = Provider.of<AppDatabase>(context, listen: false);

    if (_isOffline) {
      // Offline: Load from Local DB
      try {
        final localStudents = await (db.select(db.students)
              ..where((tbl) => tbl.classId.equals(widget.classId)))
            .get();

        setState(() {
          _students = localStudents
              .map((s) => StudentAttendance(id: s.id.toString(), rollNo: s.rollNo))
              .toList();
          _isLoading = false;
        });
      } catch (e) {
        setState(() {
          _isLoading = false;
          _students = []; // Handle error or empty state
        });
      }
    } else {
      // Online: Mock API Call and Sync to DB
      // In a real app, use ApiClient to fetch data.
      await Future.delayed(Duration(milliseconds: 800)); // Simulate API latency

      // Simulate API response
      final apiResponse = List.generate(
        50,
        (index) => StudentAttendance(
          id: 'stu_$index',
          rollNo: '${index + 1}',
        ),
      );

      // Sync to Local DB (Drift)
      await db.transaction(() async {
        // Clear existing for this class to ensure fresh sync or update efficiently
        // For simplicity, we just insert/ignore or update
        for (var student in apiResponse) {
           await db.into(db.students).insertOnConflictUpdate(
            StudentsCompanion(
              // Assuming ID from API maps to DB ID or we use a separate remoteId field.
              // Here using autoIncrement ID for simplicity, so we might duplicate if not careful.
              // In production, we'd check existence by remote ID or RollNo+ClassID unique key.
              name: drift.Value('Student ${student.rollNo}'), // Mock name
              rollNo: drift.Value(student.rollNo),
              classId: drift.Value(widget.classId),
              isSynced: drift.Value(true),
            ),
          );
        }
      });

      setState(() {
        _students = apiResponse;
        _isLoading = false;
      });
    }
  }

  void _toggleStatus(int index) {
    setState(() {
      final current = _students[index].status;
      if (current == AttendanceStatus.present) {
        _students[index].status = AttendanceStatus.absent;
      } else {
        _students[index].status = AttendanceStatus.present;
      }
    });
    _queueSync();
  }

  void _markLate(int index) {
    setState(() {
      final current = _students[index].status;
      if (current == AttendanceStatus.late) {
        _students[index].status = AttendanceStatus.present;
      } else {
        _students[index].status = AttendanceStatus.late;
      }
    });
    _queueSync();
  }

  void _markOnLeave(int index) {
    setState(() {
      _students[index].status = AttendanceStatus.onLeave;
    });
    _queueSync();
  }

  void _queueSync() async {
    // Logic to queue attendance submission to SyncQueue table
    // This ensures that changes made offline are pushed when online
    if (_isOffline) {
        try {
          final db = Provider.of<AppDatabase>(context, listen: false);

          // We would typically serialize the changes.
          // For simplicity, let's say we log the whole student list state or specific action.
          // Here we just queue a generic 'update_attendance' action.

          await db.into(db.syncQueue).insert(
            SyncQueueCompanion(
              action: drift.Value('update_attendance'),
              payload: drift.Value('{"classId": "${widget.classId}", "timestamp": "${DateTime.now().toIso8601String()}"}'),
            )
          );
        } catch (e) {
          // Handle error
          print('Error queuing sync: $e');
        }
    }
  }

  Color _getColor(AttendanceStatus status) {
    switch (status) {
      case AttendanceStatus.present:
        return Colors.green;
      case AttendanceStatus.absent:
        return Colors.red;
      case AttendanceStatus.late:
        return Colors.yellow;
      case AttendanceStatus.onLeave:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator());

    return Column(
      children: [
        if (_isOffline)
          Container(
            color: Colors.orange,
            width: double.infinity,
            padding: EdgeInsets.all(4),
            child: Text('Offline Mode - Saving locally', textAlign: TextAlign.center, style: TextStyle(color: Colors.white)),
          ),
        Expanded(
          child: GridView.builder(
            padding: EdgeInsets.all(8),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5,
              childAspectRatio: 1.0,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: _students.length,
            itemBuilder: (context, index) {
              final student = _students[index];
              return GestureDetector(
                onTap: () => _toggleStatus(index),
                onDoubleTap: () => _markLate(index),
                onLongPress: () => _markOnLeave(index),
                child: Container(
                  decoration: BoxDecoration(
                    color: _getColor(student.status),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    student.rollNo,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: student.status == AttendanceStatus.late ? Colors.black : Colors.white,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
