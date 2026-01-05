import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/services/sync_service.dart';
import 'package:mobile/core/services/token_storage_service.dart';
import 'package:mobile/data/auth_repository.dart';
import 'package:mobile/features/auth/bloc/auth_bloc.dart';
import 'package:mobile/features/saas/plans_cubit.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init((options) {
    options.dsn = 'YOUR_FLUTTER_SENTRY_DSN'; // Sentry থেকে পাওয়া DSN এখানে বসান
    options.tracesSampleRate = 1.0;
  }, appRunner: () => runApp(const EdApp()));
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

    // Auth Dependencies
    final tokenStorageService = TokenStorageService();
    final authRepository = AuthRepository(apiClient, tokenStorageService);

    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<ApiClient>.value(value: apiClient),
        RepositoryProvider<AppDatabase>.value(value: database),
        RepositoryProvider<SyncService>.value(value: syncService),
        RepositoryProvider<TokenStorageService>.value(value: tokenStorageService),
        RepositoryProvider<AuthRepository>.value(value: authRepository),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authRepository: authRepository,
              tokenStorageService: tokenStorageService,
            )..add(AppStarted()),
          ),
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
