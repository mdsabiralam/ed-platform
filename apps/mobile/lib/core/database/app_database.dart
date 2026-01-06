import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';

part 'app_database.g.dart';

// Table for Attendance Logs (Offline Cache)
class AttendanceLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get routineEntryId => text()();
  DateTimeColumn get date => dateTime()();
  TextColumn get studentId => text()();
  TextColumn get status => text()(); // PRESENT, ABSENT, LATE
  DateTimeColumn get markedAt => dateTime()();
}

// Table for Sync Queue
class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get tableName => text()(); // e.g., 'attendance_logs'
  IntColumn get recordId => integer()(); // ID of the record in the respective table
  TextColumn get operation => text()(); // CREATE, UPDATE, DELETE
  TextColumn get status => text().withDefault(const Constant('PENDING'))(); // PENDING, SYNCED, FAILED
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [AttendanceLogs, SyncQueue])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Helper to add attendance and queue it for sync
  Future<void> addAttendanceLog(String routineEntryId, DateTime date, String studentId, String status, DateTime markedAt) {
    return transaction(() async {
      final id = await into(attendanceLogs).insert(AttendanceLogsCompanion.insert(
        routineEntryId: routineEntryId,
        date: date,
        studentId: studentId,
        status: status,
        markedAt: markedAt,
      ));

      await into(syncQueue).insert(SyncQueueCompanion.insert(
        tableName: 'attendance_logs',
        recordId: id,
        operation: 'CREATE',
      ));
    });
  }

  Future<List<SyncQueueData>> getPendingSyncs() {
    return (select(syncQueue)..where((tbl) => tbl.status.equals('PENDING'))).get();
  }

  Future<AttendanceLog> getAttendanceLog(int id) {
      return (select(attendanceLogs)..where((tbl) => tbl.id.equals(id))).getSingle();
  }

  Future<void> markSynced(int id) {
    return (update(syncQueue)..where((tbl) => tbl.id.equals(id))).write(SyncQueueCompanion(
      status: Value('SYNCED'),
    ));
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));
    return NativeDatabase(file);
  });
}
