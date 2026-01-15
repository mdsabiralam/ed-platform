part of 'auth_bloc.dart';

@immutable
abstract class AuthEvent {}

class AppStarted extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;

  AuthLoginRequested(this.email, this.password);
}

class AuthProfileSelected extends AuthEvent {
  final String profileId;

  AuthProfileSelected(this.profileId);
}

class AuthLogoutRequested extends AuthEvent {}

class _AuthStatusChanged extends AuthEvent {
  final AuthStatus status;
  _AuthStatusChanged(this.status);
}
