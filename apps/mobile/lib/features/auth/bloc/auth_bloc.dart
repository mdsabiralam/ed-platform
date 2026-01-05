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
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    final token = await _tokenStorageService.getAccessToken();
    if (token != null) {
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
        emit(AuthProfileSelectionRequired(profiles));
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
      emit(AuthUnauthenticated()); // Or back to selection?
    }
  }

  Future<void> _onLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _tokenStorageService.clearTokens();
    emit(AuthUnauthenticated());
  }
}
