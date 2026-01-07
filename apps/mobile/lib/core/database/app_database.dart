import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';

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

// 4. Timetable Table
class Timetable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get teacherId => text().named('teacher_id')();
  TextColumn get subject => text()();
  TextColumn get className => text().named('class_name')();
  TextColumn get roomNo => text().named('room_no')();
  DateTimeColumn get startTime => dateTime().named('start_time')();
  DateTimeColumn get endTime => dateTime().named('end_time')();
  TextColumn get dayOfWeek => text().named('day_of_week')(); // e.g. "Monday"
  BoolColumn get isSynced => boolean().named('is_synced').withDefault(const Constant(false))();
}

@DriftDatabase(tables: [Students, AttendanceLogs, SyncQueue, Timetable])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));

    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }

    final cache = (await getTemporaryDirectory()).path;
    sqlite3.tempDirectory = cache;

    return NativeDatabase.createInBackground(file);
  });
}