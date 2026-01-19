import 'package:drift/drift.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:mobile/core/services/connectivity_service.dart';

class SyncService {
  final AppDatabase db;
  final ApiClient apiClient;
  final ConnectivityService connectivityService;

  SyncService({
    required this.db,
    required this.apiClient,
    required this.connectivityService,
  });

  /// সম্পূর্ণ সিঙ্ক প্রসেস শুরু করা
  Future<void> sync() async {
    if (await connectivityService.isConnected) {
      try {
        await pushChanges();
        await pullChanges();
        debugPrint('Sync completed successfully');
      } catch (e) {
        debugPrint('Sync failed: $e');
      }
    } else {
      debugPrint('No internet connection. Sync skipped.');
    }
  }

  /// 1.F.10: Push Sync (Local -> Server)
  Future<void> pushChanges() async {
    // ১. আন-সিঙ্ক করা স্টুডেন্টদের খুঁজে বের করা
    final unsyncedStudents = await (db.select(db.students)
          ..where((tbl) => tbl.isSynced.equals(false)))
        .get();

    for (final student in unsyncedStudents) {
      try {
        // সার্ভারে ডাটা পাঠানো
        await apiClient.post(
          '/students',
          data: {
            'name': student.name,
            'rollNo': student.rollNo,
            'classId': student.classId,
          },
        );

        // সফল হলে লোকালে isSynced = true করে দেওয়া
        await (db.update(db.students)..where((t) => t.id.equals(student.id)))
            .write(const StudentsCompanion(isSynced: Value(true)));
      } catch (e) {
        debugPrint('Failed to push student ${student.id}: $e');
      }
    }
  }

  /// 1.F.09: Pull Sync (Server -> Local)
  Future<void> pullChanges() async {
    try {
      // সার্ভার থেকে সব স্টুডেন্ট নিয়ে আসা
      final response = await apiClient.get('/students');
      if (response.statusCode == 200) {
        final List<dynamic> serverStudents = response.data as List<dynamic>;

        await db.batch((batch) {
          for (final data in serverStudents) {
            batch.insert(
              db.students,
              StudentsCompanion.insert(
                name: data['name'],
                rollNo: data['rollNo'],
                classId: data['classId'],
                isSynced: const Value(true), // সার্ভার থেকে এসেছে তাই true
              ),
              mode: InsertMode.insertOrReplace, // থাকলে আপডেট, না থাকলে ইনসার্ট
            );
          }
        });
      }
    } catch (e) {
      debugPrint('Failed to pull data: $e');
      rethrow;
    }
  }
}