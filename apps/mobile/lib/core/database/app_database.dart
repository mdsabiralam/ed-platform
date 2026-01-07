import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:sqlite3/sqlite3.dart';
// ignore: depend_on_referenced_packages
import 'package:sqlcipher_flutter_libs/sqlcipher_flutter_libs.dart';
import '../../data/local/schema.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [Students, AttendanceLogs, Marks, SyncQueue])
class AppDatabase extends _$AppDatabase {
  // Allow injecting a custom executor for testing (e.g. NativeDatabase.memory())
  AppDatabase([QueryExecutor? executor]) : super(executor ?? _openConnection());

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {
      if (from < 2) {
         await m.createTable(marks);
         await m.createTable(syncQueue);

         await m.addColumn(students, students.serverId);
         await m.addColumn(students, students.createdAt);
         await m.addColumn(students, students.updatedAt);

         await m.addColumn(attendanceLogs, attendanceLogs.serverId);
         await m.addColumn(attendanceLogs, attendanceLogs.createdAt);
         await m.addColumn(attendanceLogs, attendanceLogs.updatedAt);

         // Use custom query for index creation to avoid constructor issues
         try {
           await m.issueCustomQuery('CREATE UNIQUE INDEX IF NOT EXISTS students_server_id ON students (server_id);');
           await m.issueCustomQuery('CREATE UNIQUE INDEX IF NOT EXISTS attendance_logs_server_id ON attendance_logs (server_id);');
           await m.issueCustomQuery('CREATE UNIQUE INDEX IF NOT EXISTS marks_server_id ON marks (server_id);');
         } catch (e) {
           print('Migration Index Creation Warning: $e');
         }
      }
    }
  );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db.sqlite'));

    const storage = FlutterSecureStorage();
    String? encryptionKey = await storage.read(key: 'db_key');

    if (encryptionKey == null) {
       final keyBytes = List<int>.generate(32, (i) => Random.secure().nextInt(256));
       encryptionKey = base64UrlEncode(keyBytes);
       await storage.write(key: 'db_key', value: encryptionKey);
    }

    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }

    final cache = (await getTemporaryDirectory()).path;
    sqlite3.tempDirectory = cache;

    return NativeDatabase.createInBackground(
      file,
      setup: (database) {
        database.execute('PRAGMA key = "$encryptionKey"');
      },
    );
  });
}
