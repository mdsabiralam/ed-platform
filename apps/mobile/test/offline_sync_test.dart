import 'package:flutter_test/flutter_test.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/sync_service.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Mock Services
class MockConnectivityService extends Mock implements ConnectivityService {}
class MockApiClient extends Mock implements ApiClient {}

// Annotation to generate mocks
@GenerateNiceMocks([MockSpec<ConnectivityService>(), MockSpec<ApiClient>()])
import 'offline_sync_test.mocks.dart';

void main() {
  // Mock SharedPreferences
  SharedPreferences.setMockInitialValues({});

  group('Offline Sync Integration Test', () {
    late SyncService syncService;
    late MockConnectivityService mockConnectivityService;
    late MockApiClient mockApiClient;
    late AppDatabase db;

    setUp(() {
      mockConnectivityService = MockConnectivityService();
      mockApiClient = MockApiClient();

      // Use in-memory database for testing via new constructor
      db = AppDatabase(NativeDatabase.memory());

      syncService = SyncService(
        db: db,
        connectivityService: mockConnectivityService,
        apiClient: mockApiClient
      );
    });

    tearDown(() async {
      await db.close();
    });

    test('Step 10: Verify Offline-Online Flow', () async {
      // 1. Simulate Offline
      when(mockConnectivityService.isConnected).thenAnswer((_) async => false);
      when(mockConnectivityService.onConnectivityChanged).thenAnswer((_) => Stream.value(ConnectivityResult.none));

      // 2. Mark student absent (track mutation)
      await syncService.trackMutation(
        tableName: 'attendance',
        recordId: '123',
        operationType: 'UPDATE',
        payload: {'status': 'ABSENT'}
      );

      // Verify entry in SyncQueue DB
      final queue = await db.select(db.syncQueue).get();
      expect(queue.length, 1);
      expect(queue.first.recordId, '123');
      expect(queue.first.operationType, 'UPDATE');

      // 3. Verify Push NOT called yet
      verifyNever(mockApiClient.post('/sync/batch', data: anyNamed('data')));

      // 4. Simulate Online Switch (Trigger manually as Stream is mocked)
      // Mock API Responses
      when(mockApiClient.post('/sync/batch', data: anyNamed('data'))).thenAnswer((_) async => Response(
        requestOptions: RequestOptions(path: '/sync/batch'),
        statusCode: 200,
      ));

      when(mockApiClient.get('/sync', queryParameters: anyNamed('queryParameters'))).thenAnswer((_) async => Response(
        requestOptions: RequestOptions(path: '/sync'),
        statusCode: 200,
        data: {
          'students': [
            {'id': 'server_1', 'name': 'John', 'roll_no': '101', 'class_id': '5A', 'updated_at': '2023-01-01T10:00:00Z'}
          ],
          'attendance_logs': [],
          'marks': []
        }
      ));

      // Trigger Sync
      await syncService.syncPush();
      await syncService.syncPull();

      // 5. Verify Sync Push Triggered
      verify(mockApiClient.post('/sync/batch', data: anyNamed('data'))).called(1);

      // Verify Queue Empty
      final queueAfter = await db.select(db.syncQueue).get();
      expect(queueAfter.isEmpty, true);

      // 6. Verify Sync Pull Triggered and DB Updated
      verify(mockApiClient.get('/sync', queryParameters: anyNamed('queryParameters'))).called(1);

      final students = await db.select(db.students).get();
      expect(students.length, 1);
      expect(students.first.serverId, 'server_1');
    });
  });
}
