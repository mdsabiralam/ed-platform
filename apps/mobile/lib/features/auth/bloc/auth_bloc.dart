import 'dart:async'; // Added
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/models/profile.dart';
import 'package:mobile/core/services/token_storage_service.dart';
import 'package:mobile/data/auth_repository.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final TokenStorageService _tokenStorageService;
  late final StreamSubscription<AuthStatus> _authStatusSubscription; // Added

  AuthBloc({
    required AuthRepository authRepository,
    required TokenStorageService tokenStorageService,
  })  : _authRepository = authRepository,
        _tokenStorageService = tokenStorageService,
        super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthProfileSelected>(_onProfileSelected);
    on<AuthLogoutRequested>(_onLogoutRequested);
    on<_AuthStatusChanged>(_onAuthStatusChanged); // Added

    _authStatusSubscription = _tokenStorageService.status.listen(
      (status) => add(_AuthStatusChanged(status)),
    );
  }

  @override
  Future<void> close() {
    _authStatusSubscription.cancel();
    return super.close();
  }

  Future<void> _onAuthStatusChanged(
    _AuthStatusChanged event,
    Emitter<AuthState> emit,
  ) async {
    switch (event.status) {
      case AuthStatus.unauthenticated:
        emit(AuthUnauthenticated());
        break;
      case AuthStatus.subscriptionExpired:
        emit(AuthSubscriptionExpired());
        break;
      case AuthStatus.authenticated:
        // Do nothing or re-verify? Usually handled by specific flows.
        break;
      default:
        break;
    }
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    final token = await _tokenStorageService.getAccessToken();
    if (token != null) {
      // 3.G.09: Check for last active profile logic here if needed?
      // For now, if we have a token, we assume authenticated.
      // Ideally we might want to check if the token is valid or who it belongs to.
      emit(AuthAuthenticated());
    } else {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final profiles = await _authRepository.login(event.email, event.password);
      if (profiles.isNotEmpty) {
        // 3.G.09: Check if we have a last active profile ID
        final lastProfileId = await _tokenStorageService.getLastProfileId();
        if (lastProfileId != null && profiles.any((p) => p.id == lastProfileId)) {
             // Automatically switch to last profile
             add(AuthProfileSelected(lastProfileId));
        } else {
             emit(AuthProfileSelectionRequired(profiles));
        }
      } else {
        emit(AuthAuthenticated());
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onProfileSelected(
    AuthProfileSelected event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await _authRepository.switchProfile(event.profileId);
      emit(AuthAuthenticated());
    } catch (e) {
      emit(AuthFailure(e.toString()));
      // If switch fails, maybe go back to selection?
      // emit(AuthProfileSelectionRequired(...)); // Hard to get profiles again without re-fetching
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _tokenStorageService.clearTokens();
    // Status stream will handle emission of Unauthenticated via clearTokens -> _statusController
  }
}
