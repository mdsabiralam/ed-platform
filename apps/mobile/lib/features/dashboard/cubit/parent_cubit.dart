import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

abstract class ParentState extends Equatable {
  const ParentState();
  @override
  List<Object> get props => [];
}

class ParentInitial extends ParentState {}
class ParentLoading extends ParentState {}
class ParentLoaded extends ParentState {
  final bool isFeeDue;
  final String childName;
  final int childId;

  const ParentLoaded({
    required this.isFeeDue,
    required this.childName,
    required this.childId,
  });

  @override
  List<Object> get props => [isFeeDue, childName, childId];
}

class ParentCubit extends Cubit<ParentState> {
  ParentCubit() : super(ParentInitial());

  void loadDashboard() {
    emit(ParentLoading());
    // Simulate API call
    Future.delayed(const Duration(seconds: 1), () {
      emit(const ParentLoaded(
        isFeeDue: true,
        childName: 'Alice',
        childId: 101,
      ));
    });
  }
}
