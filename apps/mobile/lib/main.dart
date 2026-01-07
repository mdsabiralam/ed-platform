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

class EdApp extends StatefulWidget {
  const EdApp({super.key});

  @override
  State<EdApp> createState() => _EdAppState();
}

class _EdAppState extends State<EdApp> {
  late final ApiClient apiClient;
  late final AppDatabase database;
  late final SyncService syncService;
  late final TokenStorageService tokenStorageService;
  late final AuthRepository authRepository;
  late final AuthBloc authBloc;
  late final PlansCubit plansCubit;

  @override
  void initState() {
    super.initState();
    tokenStorageService = TokenStorageService();
    apiClient = ApiClient(tokenStorageService);
    database = AppDatabase();
    syncService = SyncService(
      db: database,
      apiClient: apiClient,
      connectivityService: ConnectivityService(),
    );
    authRepository = AuthRepository(apiClient, tokenStorageService);
    authBloc = AuthBloc(
      authRepository: authRepository,
      tokenStorageService: tokenStorageService,
    )..add(AppStarted());
    plansCubit = PlansCubit(apiClient);
  }

  @override
  void dispose() {
    authBloc.close();
    plansCubit.close();
    tokenStorageService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Create router with authBloc dependency
    final router = createAppRouter(authBloc);

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
          BlocProvider<AuthBloc>.value(value: authBloc),
          BlocProvider<PlansCubit>.value(value: plansCubit),
        ],
        child: MaterialApp.router(
          title: 'Ed Platform',
          theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
          routerConfig: router,
        ),
      ),
    );
  }
}
