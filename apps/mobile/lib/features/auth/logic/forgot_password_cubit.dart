import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// State
abstract class ForgotPasswordState extends Equatable {
  const ForgotPasswordState();
  @override
  List<Object> get props => [];
}

class ForgotPasswordInitial extends ForgotPasswordState {}

class ForgotPasswordLoading extends ForgotPasswordState {}

class ForgotPasswordSuccess extends ForgotPasswordState {}

class ForgotPasswordFailure extends ForgotPasswordState {
  final String error;
  const ForgotPasswordFailure(this.error);
  @override
  List<Object> get props => [error];
}

// Cubit
class ForgotPasswordCubit extends Cubit<ForgotPasswordState> {
  ForgotPasswordCubit() : super(ForgotPasswordInitial());

  Future<void> sendResetLink(String email) async {
    emit(ForgotPasswordLoading());
    try {
      // Mock API Call
      await Future.delayed(const Duration(seconds: 2));
      // Simulate success for valid looking emails, fail for specific ones if needed
      if (email.contains('error')) {
         throw Exception('Failed to send link');
      }
      emit(ForgotPasswordSuccess());
    } catch (e) {
      emit(const ForgotPasswordFailure('Failed to send reset link. Please try again.'));
    }
  }
}
