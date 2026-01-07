import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

abstract class TeacherState extends Equatable {
  const TeacherState();
  @override
  List<Object> get props => [];
}

class TeacherInitial extends TeacherState {}
class TeacherLoading extends TeacherState {}
class TeacherLoaded extends TeacherState {
  final List<String> schedule;
  final int pendingTasksCount;
  final String? currentClass; // For context awareness

  const TeacherLoaded({
    required this.schedule,
    required this.pendingTasksCount,
    this.currentClass,
  });

  @override
  List<Object> get props => [schedule, pendingTasksCount, currentClass ?? ''];
}

class TeacherCubit extends Cubit<TeacherState> {
  StreamSubscription<int>? _tickerSubscription;

  TeacherCubit() : super(TeacherInitial());

  void loadDashboard() {
    emit(TeacherLoading());
    // Simulate API call
    Future.delayed(const Duration(seconds: 1), () {
      _startContextAwareTicker();
      emit(const TeacherLoaded(
        schedule: ['Maths - 5A', 'Science - 6B', 'Free Period', 'Physics - 9A'],
        pendingTasksCount: 3,
        currentClass: '5-B', // Initial State
      ));
    });
  }

  void _startContextAwareTicker() {
    _tickerSubscription?.cancel();
    // Check every minute (simulated here with 10 seconds for demo/test)
    _tickerSubscription = Stream.periodic(const Duration(seconds: 10), (x) => x).listen((_) {
      final now = DateTime.now();
      // Logic to check TimeTable against `now`
      // For this implementation, we will toggle the current class based on even/odd minutes as a mock
      if (state is TeacherLoaded) {
         final currentState = state as TeacherLoaded;
         final newClass = now.minute % 2 == 0 ? '5-B' : 'Break';
         if (currentState.currentClass != newClass) {
           emit(TeacherLoaded(
             schedule: currentState.schedule,
             pendingTasksCount: currentState.pendingTasksCount,
             currentClass: newClass,
           ));
         }
      }
    });
  }

  @override
  Future<void> close() {
    _tickerSubscription?.cancel();
    return super.close();
  }
}
