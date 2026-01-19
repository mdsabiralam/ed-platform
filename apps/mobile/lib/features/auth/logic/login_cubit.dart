import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mobile/core/services/auth_service.dart';

// State
abstract class LoginState extends Equatable {
  const LoginState();
  @override
  List<Object> get props => [];
}

class LoginInitial extends LoginState {}

class LoginLoading extends LoginState {}

class LoginSuccess extends LoginState {
  final String role;
  const LoginSuccess(this.role);
  @override
  List<Object> get props => [role];
}

class LoginFailure extends LoginState {
  final String error;
  const LoginFailure(this.error);
  @override
  List<Object> get props => [error];
}

// Cubit
class LoginCubit extends Cubit<LoginState> {
  final AuthService _authService;

  LoginCubit(this._authService) : super(LoginInitial());

  Future<void> login(String email, String password) async {
    emit(LoginLoading());
    try {
      final response = await _authService.login(email, password);
      final role = response['role'] as String;
      emit(LoginSuccess(role));
    } catch (e) {
      // In a real app, parse DioException for better messages
      emit(const LoginFailure('Invalid Email or Password'));
    }
  }
}
