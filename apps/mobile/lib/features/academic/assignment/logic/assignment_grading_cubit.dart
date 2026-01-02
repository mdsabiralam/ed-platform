import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_sound/flutter_sound.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../data/assignment_repository.dart';
import 'assignment_grading_state.dart';

class AssignmentGradingCubit extends Cubit<AssignmentGradingState> {
  final AssignmentRepository _repository;
  final FlutterSoundRecorder _recorder = FlutterSoundRecorder();
  final FlutterSoundPlayer _player = FlutterSoundPlayer();
  String? _tempAudioPath;

  AssignmentGradingCubit(this._repository) : super(AssignmentGradingInitial()) {
    _initAudio();
  }

  Future<void> _initAudio() async {
    await _recorder.openRecorder();
    await _player.openPlayer();
  }

  Future<void> loadSubmission(String submissionId) async {
    emit(AssignmentGradingLoading());
    try {
      final submission = await _repository.getSubmission(submissionId);
      emit(AssignmentGradingLoaded(submission: submission));
    } catch (e) {
      emit(AssignmentGradingError(e.toString()));
    }
  }

  void toggleDrawingMode() {
    if (state is AssignmentGradingLoaded) {
      final currentState = state as AssignmentGradingLoaded;
      emit(currentState.copyWith(isDrawingMode: !currentState.isDrawingMode));
    }
  }

  Future<void> startRecording() async {
    final status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      emit(AssignmentGradingError('Microphone permission not granted'));
      return;
    }

    final tempDir = await getTemporaryDirectory();
    _tempAudioPath = '${tempDir.path}/feedback_${DateTime.now().millisecondsSinceEpoch}.aac';

    await _recorder.startRecorder(toFile: _tempAudioPath);

    if (state is AssignmentGradingLoaded) {
      emit((state as AssignmentGradingLoaded).copyWith(isRecording: true));
    }
  }

  Future<void> stopRecording() async {
    await _recorder.stopRecorder();
    if (state is AssignmentGradingLoaded) {
      emit((state as AssignmentGradingLoaded).copyWith(
        isRecording: false,
        recordedFilePath: _tempAudioPath,
      ));
    }
  }

  Future<void> playRecording() async {
    if (state is AssignmentGradingLoaded) {
      final currentState = state as AssignmentGradingLoaded;
      if (currentState.recordedFilePath != null) {
        await _player.startPlayer(
          fromURI: currentState.recordedFilePath,
          whenFinished: () {
            emit(currentState.copyWith(isPlaying: false));
          },
        );
        emit(currentState.copyWith(isPlaying: true));
      }
    }
  }

  Future<void> stopPlayback() async {
    await _player.stopPlayer();
    if (state is AssignmentGradingLoaded) {
      emit((state as AssignmentGradingLoaded).copyWith(isPlaying: false));
    }
  }

  void addAnnotation(Map<String, dynamic> annotation) {
    if (state is AssignmentGradingLoaded) {
      final currentState = state as AssignmentGradingLoaded;
      final updatedAnnotations = List<Map<String, dynamic>>.from(currentState.annotations)
        ..add(annotation);
      emit(currentState.copyWith(annotations: updatedAnnotations));
    }
  }

  Future<void> saveGrading({
    required String teacherFeedback,
    required double obtainedMarks,
  }) async {
    if (state is AssignmentGradingLoaded) {
      final currentState = state as AssignmentGradingLoaded;
      try {
        emit(AssignmentGradingLoading());

        // 1. Upload Audio if exists
        if (currentState.recordedFilePath != null) {
           await _repository.uploadAudioFeedback(
            currentState.submission.id,
            currentState.recordedFilePath!,
          );
        }

        // 2. Save Annotations if any
        if (currentState.annotations.isNotEmpty) {
           await _repository.saveAnnotations(
             currentState.submission.id,
             currentState.annotations,
           );
        }

        // 3. Save Marks & Text Feedback
        await _repository.saveFeedback(
          submissionId: currentState.submission.id,
          teacherFeedback: teacherFeedback,
          obtainedMarks: obtainedMarks,
        );

        // Reload
        loadSubmission(currentState.submission.id);
      } catch (e) {
        emit(AssignmentGradingError(e.toString()));
        // Restore previous state if needed, simplified here
      }
    }
  }

  @override
  Future<void> close() {
    _recorder.closeRecorder();
    _player.closePlayer();
    return super.close();
  }
}
