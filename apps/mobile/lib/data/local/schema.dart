import 'package:drift/drift.dart';

// Students Table
@TableIndex(name: 'students_server_id', columns: {#serverId}, unique: true)
class Students extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get serverId => text().named('server_id').nullable()();
  TextColumn get name => text()();
  TextColumn get rollNo => text().named('roll_no')();
  TextColumn get classId => text().named('class_id')();
  DateTimeColumn get createdAt => dateTime().named('created_at').withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().named('updated_at').withDefault(currentDateAndTime)();
}

// Attendance Logs Table
@TableIndex(name: 'attendance_logs_server_id', columns: {#serverId}, unique: true)
class AttendanceLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get serverId => text().named('server_id').nullable()();
  TextColumn get studentId => text().named('student_id')();
  TextColumn get date => text()();
  TextColumn get status => text()(); // PRESENT, ABSENT, etc.
  DateTimeColumn get createdAt => dateTime().named('created_at').withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().named('updated_at').withDefault(currentDateAndTime)();
}

// Marks Table
@TableIndex(name: 'marks_server_id', columns: {#serverId}, unique: true)
class Marks extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get serverId => text().named('server_id').nullable()();
  TextColumn get studentId => text().named('student_id')();
  TextColumn get subjectId => text().named('subject_id')();
  RealColumn get obtainedMarks => real().named('obtained_marks')();
  RealColumn get totalMarks => real().named('total_marks')();
  DateTimeColumn get createdAt => dateTime().named('created_at').withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().named('updated_at').withDefault(currentDateAndTime)();
}

// Sync Queue Table for Mutation Tracking
class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get tableName => text().named('table_name')(); // e.g., 'attendance'
  TextColumn get recordId => text().named('record_id')(); // Local or Server ID
  TextColumn get operationType => text().named('operation_type')(); // CREATE, UPDATE, DELETE
  TextColumn get payload => text()(); // JSON string
  DateTimeColumn get timestamp => dateTime().withDefault(currentDateAndTime)();
}
