import 'package:dio/dio.dart';
import '../../../../core/api_client.dart';
import '../../../../core/database/app_database.dart';
import '../models/exam_schedule_model.dart' as model;
import 'package:drift/drift.dart' as drift;

class ExamRepository {
  final ApiClient apiClient;
  final AppDatabase appDatabase;

  ExamRepository({
    required this.apiClient,
    required this.appDatabase,
  });

  Future<List<model.ExamSchedule>> getExamSchedules(String classId) async {
    try {
      // 1. Try Fetch from API
      final response = await apiClient.get(
        '/academic/exam/schedule',
        queryParameters: {'classId': classId},
      );

      if (response.data is List) {
        final schedules = (response.data as List)
            .map((e) => model.ExamSchedule.fromJson(e))
            .toList();

        // 2. Save to Local DB (Offline Cache)
        await _saveToLocalDb(classId, schedules);

        return schedules;
      } else {
        return [];
      }
    } catch (e) {
      // 3. If API fails, fallback to Local DB
      return await _fetchFromLocalDb(classId);
    }
  }

  Future<void> _saveToLocalDb(String classId, List<model.ExamSchedule> schedules) async {
    // Transaction: Delete old records for this class, Insert new ones
    await appDatabase.transaction(() async {
      await (appDatabase.delete(appDatabase.examSchedules)
            ..where((t) => t.classId.equals(classId)))
          .go();

      for (var schedule in schedules) {
        await appDatabase.into(appDatabase.examSchedules).insert(
              ExamSchedulesCompanion.insert(
                id: schedule.id,
                examName: schedule.examName,
                subjectName: schedule.subjectName,
                startTime: schedule.startTime,
                durationMinutes: schedule.durationMinutes,
                classId: classId,
              ),
              mode: drift.InsertMode.insertOrReplace,
            );
      }
    });
  }

  Future<List<model.ExamSchedule>> _fetchFromLocalDb(String classId) async {
    final query = appDatabase.select(appDatabase.examSchedules)
      ..where((t) => t.classId.equals(classId))
      ..orderBy([(t) => drift.OrderingTerm(expression: t.startTime)]);

    final rows = await query.get();

    return rows
        .map((row) => model.ExamSchedule(
              id: row.id,
              examName: row.examName,
              subjectName: row.subjectName,
              startTime: row.startTime,
              durationMinutes: row.durationMinutes,
            ))
        .toList();
  }
}
