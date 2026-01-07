part of 'auth_bloc.dart';

@immutable
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthSuccess extends AuthState {
  final List<Map<String, dynamic>> profiles;
  final String token;

  AuthSuccess({required this.profiles, required this.token});
}

class AuthAuthenticated extends AuthState {
  final String role;
  AuthAuthenticated(this.role);
}

class AuthUnauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String error;
  AuthFailure(this.error);
}
