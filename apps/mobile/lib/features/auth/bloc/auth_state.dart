part of 'auth_bloc.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  // If no multiple profiles, we are just authenticated
}

class AuthProfileSelectionRequired extends AuthState {
  final List<Profile> profiles;

  AuthProfileSelectionRequired(this.profiles);
}

class AuthUnauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String message;

  AuthFailure(this.message);
}
