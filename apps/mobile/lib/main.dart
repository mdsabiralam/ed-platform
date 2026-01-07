import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/services/sync_service.dart';
import 'package:mobile/features/saas/plans_cubit.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();

  await SentryFlutter.init((options) {
    options.dsn = 'YOUR_FLUTTER_SENTRY_DSN'; // Sentry থেকে পাওয়া DSN এখানে বসান
    options.tracesSampleRate = 1.0;
  },
      appRunner: () => runApp(
            EasyLocalization(
              supportedLocales: const [
                Locale('en'),
                Locale('hi'),
                Locale('bn')
              ],
              path: 'assets/translations',
              fallbackLocale: const Locale('en'),
              child: const EdApp(),
            ),
          ));
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
          localizationsDelegates: context.localizationDelegates,
          supportedLocales: context.supportedLocales,
          locale: context.locale,
          theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
          // 1.E.04: GoRouter Configuration
          routerConfig: appRouter,
        ),
      ),
    );
  }
}
