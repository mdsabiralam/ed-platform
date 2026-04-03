import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/assignment_repository.dart';
import '../data/assignment_submission.dart';

// State
abstract class ClassWallState extends Equatable {
  const ClassWallState();
  @override
  List<Object?> get props => [];
}

class ClassWallInitial extends ClassWallState {}
class ClassWallLoading extends ClassWallState {}
class ClassWallLoaded extends ClassWallState {
  final List<AssignmentSubmission> submissions;
  const ClassWallLoaded(this.submissions);
  @override
  List<Object?> get props => [submissions];
}
class ClassWallError extends ClassWallState {
  final String message;
  const ClassWallError(this.message);
  @override
  List<Object?> get props => [message];
}

// Cubit
class ClassWallCubit extends Cubit<ClassWallState> {
  final AssignmentRepository _repository;

  ClassWallCubit(this._repository) : super(ClassWallInitial());

  Future<void> loadFeaturedSubmissions(String assignmentId) async {
    emit(ClassWallLoading());
    try {
      final submissions = await _repository.getFeaturedSubmissions(assignmentId);
      emit(ClassWallLoaded(submissions));
    } catch (e) {
      emit(ClassWallError(e.toString()));
    }
  }
}
