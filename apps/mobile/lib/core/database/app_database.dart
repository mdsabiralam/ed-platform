import 'package:drift/drift.dart';
import 'connection/connection.dart' as impl;

part 'app_database.g.dart';

// 1. Students Table
class Students extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get rollNo => text().named('roll_no')();
  TextColumn get classId => text().named('class_id')();
  BoolColumn get isSynced => boolean().named('is_synced').withDefault(const Constant(false))();
}

// 2. Attendance Logs Table
class AttendanceLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get studentId => text().named('student_id')();
  TextColumn get date => text()();
  TextColumn get status => text()();
  BoolColumn get isSynced => boolean().named('is_synced').withDefault(const Constant(false))();
}

class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get action => text()();
  TextColumn get payload => text()();
  DateTimeColumn get createdAt => dateTime().named('created_at').withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [Students, AttendanceLogs, SyncQueue])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(impl.openConnection());

  @override
  int get schemaVersion => 1;
}
