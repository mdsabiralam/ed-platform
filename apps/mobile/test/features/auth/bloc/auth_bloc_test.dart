import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/features/auth/bloc/auth_bloc.dart';
import 'package:mobile/data/auth_repository.dart';
import 'package:mobile/core/services/token_storage_service.dart';
import 'package:mobile/core/models/profile.dart';
import 'dart:async';

class MockAuthRepository extends Mock implements AuthRepository {}
class MockTokenStorageService extends Mock implements TokenStorageService {}

void main() {
  group('AuthBloc', () {
    late AuthRepository authRepository;
    late TokenStorageService tokenStorageService;
    late AuthBloc authBloc;
    late StreamController<AuthStatus> statusController;

    setUp(() {
      authRepository = MockAuthRepository();
      tokenStorageService = MockTokenStorageService();
      statusController = StreamController<AuthStatus>.broadcast();
      when(() => tokenStorageService.status).thenAnswer((_) => statusController.stream);
    });

    tearDown(() {
      statusController.close();
      authBloc.close();
    });

    test('initial state is AuthInitial', () {
      authBloc = AuthBloc(authRepository: authRepository, tokenStorageService: tokenStorageService);
      expect(authBloc.state, isA<AuthInitial>());
    });

    blocTest<AuthBloc, AuthState>(
      'emits [AuthAuthenticated] when AppStarted and token exists',
      build: () {
        when(() => tokenStorageService.getAccessToken()).thenAnswer((_) async => 'token');
        return AuthBloc(authRepository: authRepository, tokenStorageService: tokenStorageService);
      },
      act: (bloc) => bloc.add(AppStarted()),
      expect: () => [isA<AuthAuthenticated>()],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthUnauthenticated] when AppStarted and token does not exist',
      build: () {
        when(() => tokenStorageService.getAccessToken()).thenAnswer((_) async => null);
        return AuthBloc(authRepository: authRepository, tokenStorageService: tokenStorageService);
      },
      act: (bloc) => bloc.add(AppStarted()),
      expect: () => [isA<AuthUnauthenticated>()],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] when AuthLoginRequested success with no profiles',
      build: () {
        when(() => authRepository.login(any(), any())).thenAnswer((_) async => []);
        return AuthBloc(authRepository: authRepository, tokenStorageService: tokenStorageService);
      },
      act: (bloc) => bloc.add(AuthLoginRequested('test@email.com', 'password')),
      expect: () => [isA<AuthLoading>(), isA<AuthAuthenticated>()],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthSubscriptionExpired] when AuthStatus.subscriptionExpired is emitted',
      build: () {
         return AuthBloc(authRepository: authRepository, tokenStorageService: tokenStorageService);
      },
      act: (bloc) => statusController.add(AuthStatus.subscriptionExpired),
      expect: () => [isA<AuthSubscriptionExpired>()],
    );
  });
}
