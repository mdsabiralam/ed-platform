import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/services/sync_service.dart';
import 'package:mobile/features/saas/plans_cubit.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    await SentryFlutter.init((options) {
      options.dsn = 'https://examplePublicKey@o0.ingest.sentry.io/0';
      options.tracesSampleRate = 1.0;
      options.profilesSampleRate = 1.0;
    });

    // Custom Trace: app_startup_time
    final transaction = Sentry.startTransaction('app_startup_time', 'task');
    try {
        runApp(const EdApp());
    } catch (e) {
        transaction.throwable = e;
        transaction.status = SpanStatus.internalError();
    } finally {
        await transaction.finish();
    }

  }, (exception, stackTrace) async {
    await Sentry.captureException(exception, stackTrace: stackTrace);
  });
}

class EdApp extends StatelessWidget {
  const EdApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 1.E.07: ApiClient Instance
    final apiClient = ApiClient();

    // 1.F.06: Database Instance
    final database = AppDatabase();

    // 1.F.07: Sync Service Instance
    final syncService = SyncService(
      db: database,
      apiClient: apiClient,
      connectivityService: ConnectivityService(),
    );

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ApiClient>.value(value: apiClient),
        RepositoryProvider<AppDatabase>.value(value: database),
        RepositoryProvider<SyncService>.value(value: syncService),
      ],
      child: MultiBlocProvider(
        providers: [
          // 1.E.03: State Management (Cubit)
          BlocProvider<PlansCubit>(create: (context) => PlansCubit(apiClient)),
        ],
        child: MaterialApp.router(
          title: 'Ed Platform',
          theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
          // 1.E.04: GoRouter Configuration
          routerConfig: appRouter,
        ),
      ),
    );
  }
}
