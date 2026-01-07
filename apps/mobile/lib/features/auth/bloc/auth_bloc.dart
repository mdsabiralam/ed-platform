import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/api/api_client.dart'; // Assuming this exists or I should use it? I'll mock if needed.
// Actually I don't need ApiClient if I just simulate for now, but better to be robust.

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  // final ApiClient apiClient; // In a real app

  AuthBloc() : super(AuthInitial()) {
    on<AuthLoginRequested>(_onLoginRequested);
    on<AuthLogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));

      if (event.email == 'error') {
        throw Exception('Invalid Credentials');
      }

      // Mock Response
      final profiles = [
        {'id': 'p1', 'role': 'PARENT', 'name': 'Parent Profile'},
        {'id': 'p2', 'role': 'TEACHER', 'name': 'Teacher Profile'},
      ];
      const token = 'dummy_jwt_token';

      emit(AuthSuccess(profiles: profiles, token: token));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  void _onLogoutRequested(AuthLogoutRequested event, Emitter<AuthState> emit) {
    emit(AuthUnauthenticated());
  }
}
