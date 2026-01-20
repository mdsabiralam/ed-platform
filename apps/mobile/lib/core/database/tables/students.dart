import 'package:drift/drift.dart';

class Students extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 1, max: 50)();
  TextColumn get rollNo => text()();
  TextColumn get classId => text()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}
