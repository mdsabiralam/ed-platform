import 'package:equatable/equatable.dart';

abstract class ParentState extends Equatable {
  const ParentState();

  @override
  List<Object?> get props => [];
}

class ParentInitial extends ParentState {}

class ParentLoading extends ParentState {}

class ParentLoaded extends ParentState {
  final List<Map<String, dynamic>> children;
  final String? currentStudentId;

  const ParentLoaded({
    required this.children,
    this.currentStudentId,
  });

  @override
  List<Object?> get props => [children, currentStudentId];

  ParentLoaded copyWith({
    List<Map<String, dynamic>>? children,
    String? currentStudentId,
  }) {
    return ParentLoaded(
      children: children ?? this.children,
      currentStudentId: currentStudentId ?? this.currentStudentId,
    );
  }
}

class ParentError extends ParentState {
  final String message;

  const ParentError(this.message);

  @override
  List<Object> get props => [message];
}
