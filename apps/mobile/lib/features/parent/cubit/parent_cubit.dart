import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/token_storage_service.dart';
import 'parent_state.dart';

class ParentCubit extends Cubit<ParentState> {
  final TokenStorageService _tokenStorage;

  ParentCubit(this._tokenStorage) : super(ParentInitial());

  // Mock data for children since we don't have the API implemented yet
  // In a real scenario, this would come from a repository
  Future<void> loadChildren() async {
    emit(ParentLoading());
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));

      final children = [
        {'id': 'student_1', 'name': 'Child A', 'class': '10-A'},
        {'id': 'student_2', 'name': 'Child B', 'class': '8-B'},
      ];

      // Try to get saved student ID, or default to the first one
      String? currentId = await _tokenStorage.getCurrentStudentId();
      if (currentId == null && children.isNotEmpty) {
        currentId = children.first['id'] as String;
        await _tokenStorage.saveCurrentStudentId(currentId);
      }

      emit(ParentLoaded(children: children, currentStudentId: currentId));
    } catch (e) {
      emit(ParentError(e.toString()));
    }
  }

  Future<void> switchChild(String studentId) async {
    final currentState = state;
    if (currentState is ParentLoaded) {
      // Save to local storage
      await _tokenStorage.saveCurrentStudentId(studentId);

      // Update state
      emit(currentState.copyWith(currentStudentId: studentId));

      // In a real app, you might trigger other cubits here or listen to this state change
      // in the UI to refresh other widgets.
    }
  }
}
