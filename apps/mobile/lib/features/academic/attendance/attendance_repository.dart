import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart' as drift;
import '../../core/database/app_database.dart';

class AttendanceRepository {
  final AppDatabase db;
  final Dio dio;

  AttendanceRepository(this.db, this.dio) {
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result != ConnectivityResult.none) {
        syncAttendance();
      }
    });
  }

  // Fetch Students (Offline)
  Future<List<Map<String, dynamic>>> getStudents() async {
    final students = await db.select(db.students).get();

    // If empty, seed for demo purpose
    if (students.isEmpty) {
        await seedStudents();
        return getStudents();
    }

    return students.map((s) => {
      'id': s.remoteId,
      'name': s.name,
      'status': 'PRESENT', // Default
    }).toList();
  }

  Future<void> seedStudents() async {
      final batch = List.generate(50, (index) => StudentsCompanion(
          remoteId: drift.Value('stu_$index'),
          name: drift.Value('Student ${index + 1}'),
          rollNo: drift.Value('${index + 1}'),
          classId: const drift.Value('class_1'),
      ));

      await db.batch((batchOps) {
          batchOps.insertAll(db.students, batch);
      });
  }

  // Mark attendance (Offline first)
  Future<void> markAttendance(List<Map<String, dynamic>> records) async {
    // Save to local DB
    for (var record in records) {
      await db.into(db.attendanceLogs).insert(
            AttendanceLogsCompanion(
              studentId: drift.Value(record['studentId']),
              date: drift.Value(record['date']),
              status: drift.Value(record['status']),
              isSynced: const drift.Value(false),
            ),
          );
    }

    // Try sync if online
    await syncAttendance();
  }

  Future<void> syncAttendance() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) return;

    // Fetch unsynced
    final unsynced = await (db.select(db.attendanceLogs)
          ..where((t) => t.isSynced.equals(false)))
        .get();

    if (unsynced.isEmpty) return;

    // Prepare payload
    final payload = unsynced.map((e) => {
      'studentId': e.studentId,
      'date': e.date,
      'status': e.status,
    }).toList();

    try {
      await dio.post('/academic/attendance/bulk', data: {'records': payload});

      // Mark as synced
      for (var log in unsynced) {
        await (db.update(db.attendanceLogs)
              ..where((t) => t.id.equals(log.id)))
            .write(const AttendanceLogsCompanion(isSynced: drift.Value(true)));
      }
    } catch (e) {
      // Keep for retry
      print('Sync failed: $e');
    }
  }
}
