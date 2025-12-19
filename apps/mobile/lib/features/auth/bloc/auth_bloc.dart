import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
part 'auth_event.dart';
part 'auth_state.dart';
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<AuthLoginRequested>((event, emit) async {
      emit(AuthLoading());
      await Future.delayed(const Duration(seconds: 1)); 
      emit(AuthAuthenticated());
    });
    on<AuthLogoutRequested>((event, emit) {
      emit(AuthUnauthenticated());
    });
  }
}
