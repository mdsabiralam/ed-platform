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

// 4. Draft Answers Table (Added for Offline Exam)
class DraftAnswers extends Table {
  TextColumn get examId => text().named('exam_id')();
  TextColumn get questionId => text().named('question_id')();
  TextColumn get selectedOption => text().named('selected_option')();
  DateTimeColumn get timestamp => dateTime().named('timestamp').withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {examId, questionId};
}

@DriftDatabase(tables: [Students, AttendanceLogs, SyncQueue, DraftAnswers])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          await m.createTable(draftAnswers);
        }
      },
    );
  }

  // --- Draft Answer Helpers ---

  /// Saves a user's selection locally. Uses InsertMode.insertOrReplace to update if exists.
  Future<void> saveDraftAnswer(String examId, String questionId, String selectedOption) {
    return into(draftAnswers).insert(
      DraftAnswersCompanion(
        examId: Value(examId),
        questionId: Value(questionId),
        selectedOption: Value(selectedOption),
        timestamp: Value(DateTime.now()),
      ),
      mode: InsertMode.insertOrReplace,
    );
  }

  /// Retrieves all draft answers for a specific exam.
  Future<List<DraftAnswer>> getDraftAnswers(String examId) {
    return (select(draftAnswers)..where((t) => t.examId.equals(examId))).get();
  }
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
