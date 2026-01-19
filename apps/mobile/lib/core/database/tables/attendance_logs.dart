import 'package:drift/drift.dart';

class AttendanceLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  DateTimeColumn get date => dateTime()();
  BoolColumn get present => boolean()();
  IntColumn get studentId => integer()();
}
