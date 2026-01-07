import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'database/app_database.dart';
import 'api_client.dart';
import 'services/connectivity_service.dart';

class SyncService {
  final AppDatabase db;
  final ConnectivityService connectivityService;
  final ApiClient apiClient;

  SyncService({
    required this.db,
    required this.connectivityService,
    required this.apiClient,
  }) {
    // Listen for connectivity changes
    connectivityService.onConnectivityChanged.listen((result) async {
      if (result != ConnectivityResult.none) {
        // Ensure Push completes before Pull to avoid overwriting local changes with stale server data
        await _syncPendingData();
        await syncPull();
      }
    });
  }

  Future<void> syncPull({String? scope}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastPulledAt = prefs.getString('last_pulled_at'); // Null if first sync

      // Call API
      // GET /sync?since={timestamp}&scope={scope}
      final queryParams = <String, dynamic>{'scope': scope};
      if (lastPulledAt != null) {
        queryParams['since'] = lastPulledAt;
      }

      final response = await apiClient.get('/sync', queryParameters: queryParams);

      if (response.statusCode == 200) {
        final data = response.data;

        // Upsert records (Server Wins)
        await db.transaction(() async {
          // 1. Students
          if (data['students'] != null) {
            for (var item in data['students']) {
               final entry = StudentsCompanion(
                 serverId: Value(item['id']),
                 name: Value(item['name']),
                 rollNo: Value(item['roll_no']),
                 classId: Value(item['class_id']),
                 updatedAt: Value(DateTime.parse(item['updated_at'])),
                 // Assuming createdAt is also synced or defaults
               );
               await db.into(db.students).insertOnConflictUpdate(entry);
            }
          }

          // 2. Attendance Logs
          if (data['attendance_logs'] != null) {
            for (var item in data['attendance_logs']) {
               final entry = AttendanceLogsCompanion(
                 serverId: Value(item['id']),
                 studentId: Value(item['student_id']),
                 date: Value(item['date']),
                 status: Value(item['status']),
                 updatedAt: Value(DateTime.parse(item['updated_at'])),
               );
               await db.into(db.attendanceLogs).insertOnConflictUpdate(entry);
            }
          }

          // 3. Marks
          if (data['marks'] != null) {
            for (var item in data['marks']) {
               final entry = MarksCompanion(
                 serverId: Value(item['id']),
                 studentId: Value(item['student_id']),
                 subjectId: Value(item['subject_id']),
                 obtainedMarks: Value(item['obtained_marks']),
                 totalMarks: Value(item['total_marks']),
                 updatedAt: Value(DateTime.parse(item['updated_at'])),
               );
               await db.into(db.marks).insertOnConflictUpdate(entry);
            }
          }
        });

        // Update last_pulled_at
        await prefs.setString('last_pulled_at', DateTime.now().toIso8601String());
      }
    } catch (e) {
      print('Sync Pull Error: $e');
    }
  }

  Future<void> syncPush() async {
    final pendingChanges = await (db.select(db.syncQueue)
      ..orderBy([(t) => OrderingTerm(expression: t.timestamp)])).get();

    if (pendingChanges.isEmpty) return;

    final batchPayload = pendingChanges.map((entry) => {
      'id': entry.id,
      'table_name': entry.tableName,
      'record_id': entry.recordId,
      'operation_type': entry.operationType,
      'payload': jsonDecode(entry.payload),
      'timestamp': entry.timestamp.toIso8601String(),
    }).toList();

    try {
      final response = await apiClient.post('/sync/batch', data: {'changes': batchPayload});

      if (response.statusCode == 200) {
        final idsToDelete = pendingChanges.map((e) => e.id).toList();
        await (db.delete(db.syncQueue)..where((t) => t.id.isIn(idsToDelete))).go();
      }
    } catch (e) {
      print('Sync Push Error: $e');
    }
  }

  Future<void> _syncPendingData() async {
    print('Connectivity restored. Syncing pending data...');
    await syncPush();
  }

  Future<void> trackMutation({
    required String tableName,
    required String recordId,
    required String operationType,
    required Map<String, dynamic> payload,
  }) async {
    await db.into(db.syncQueue).insert(
      SyncQueueCompanion(
        tableName: Value(tableName),
        recordId: Value(recordId),
        operationType: Value(operationType),
        payload: Value(jsonEncode(payload)),
        timestamp: Value(DateTime.now()),
      )
    );

    if (await connectivityService.isConnected) {
      syncPush();
    }
  }
}
