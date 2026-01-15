import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/bloc/auth_bloc.dart';
import 'package:mobile/features/auth/login_screen.dart';
import 'package:mobile/features/auth/plan_list_screen.dart';
import 'package:mobile/features/saas/payment_required_screen.dart';
import 'package:mobile/core/router/go_router_refresh_stream.dart';

GoRouter createAppRouter(AuthBloc authBloc) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) {
      final authState = authBloc.state;
      final isLoggingIn = state.location == '/login';

      if (authState is AuthUnauthenticated) {
        return isLoggingIn ? null : '/login';
      }

      if (authState is AuthAuthenticated) {
         if (isLoggingIn) return '/plans';
      }

      if (authState is AuthSubscriptionExpired) {
        return '/payment-required';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/plans',
        builder: (context, state) => const PlanListScreen(),
      ),
      GoRoute(
        path: '/payment-required',
        builder: (context, state) => const PaymentRequiredScreen(),
      ),
    ],
  );
}
