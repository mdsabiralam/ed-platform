import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

abstract class StudentState extends Equatable {
  const StudentState();
  @override
  List<Object> get props => [];
}

class StudentInitial extends StudentState {}
class StudentLoading extends StudentState {}
class StudentLoaded extends StudentState {
  final List<String> homework;
  final List<double> examScores;

  const StudentLoaded({
    required this.homework,
    required this.examScores,
  });

  @override
  List<Object> get props => [homework, examScores];
}

class StudentCubit extends Cubit<StudentState> {
  StudentCubit() : super(StudentInitial());

  void loadDashboard() {
    emit(StudentLoading());
    // Simulate API call
    Future.delayed(const Duration(seconds: 1), () {
      emit(const StudentLoaded(
        homework: ['Math: Ex 4.2', 'Physics: Read Chapter 3', 'English: Essay'],
        examScores: [70, 85, 60, 90, 88], // Sample trend data
      ));
    });
  }
}
