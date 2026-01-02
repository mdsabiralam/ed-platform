import 'package:equatable/equatable.dart';
import '../data/assignment_submission.dart';

abstract class AssignmentGradingState extends Equatable {
  const AssignmentGradingState();

  @override
  List<Object?> get props => [];
}

class AssignmentGradingInitial extends AssignmentGradingState {}

class AssignmentGradingLoading extends AssignmentGradingState {}

class AssignmentGradingLoaded extends AssignmentGradingState {
  final AssignmentSubmission submission;
  final bool isDrawingMode;
  final bool isRecording;
  final String? recordedFilePath;
  final bool isPlaying;
  final List<Map<String, dynamic>> annotations;

  const AssignmentGradingLoaded({
    required this.submission,
    this.isDrawingMode = false,
    this.isRecording = false,
    this.recordedFilePath,
    this.isPlaying = false,
    this.annotations = const [],
  });

  AssignmentGradingLoaded copyWith({
    AssignmentSubmission? submission,
    bool? isDrawingMode,
    bool? isRecording,
    String? recordedFilePath,
    bool? isPlaying,
    List<Map<String, dynamic>>? annotations,
  }) {
    return AssignmentGradingLoaded(
      submission: submission ?? this.submission,
      isDrawingMode: isDrawingMode ?? this.isDrawingMode,
      isRecording: isRecording ?? this.isRecording,
      recordedFilePath: recordedFilePath ?? this.recordedFilePath,
      isPlaying: isPlaying ?? this.isPlaying,
      annotations: annotations ?? this.annotations,
    );
  }

  @override
  List<Object?> get props => [
        submission,
        isDrawingMode,
        isRecording,
        recordedFilePath,
        isPlaying,
        annotations,
      ];
}

class AssignmentGradingError extends AssignmentGradingState {
  final String message;

  const AssignmentGradingError(this.message);

  @override
  List<Object?> get props => [message];
}
