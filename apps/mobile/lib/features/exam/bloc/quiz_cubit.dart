import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../core/database/app_database.dart';
import '../models/quiz_models.dart';

// --- State ---
class QuizState extends Equatable {
  final QuizExam? exam;
  final int currentQuestionIndex;
  final int remainingSeconds;
  final Map<String, String> answers; // questionId -> selectedOption
  final bool isLoading;
  final bool isSubmitting;
  final bool isCompleted;
  final int backgroundAttemptCount; // Cheating tracking
  final Map<String, int> timeSpent; // questionId -> seconds
  final DateTime? currentQuestionStartTime;

  const QuizState({
    this.exam,
    this.currentQuestionIndex = 0,
    this.remainingSeconds = 0,
    this.answers = const {},
    this.isLoading = false,
    this.isSubmitting = false,
    this.isCompleted = false,
    this.backgroundAttemptCount = 0,
    this.timeSpent = const {},
    this.currentQuestionStartTime,
  });

  QuizState copyWith({
    QuizExam? exam,
    int? currentQuestionIndex,
    int? remainingSeconds,
    Map<String, String>? answers,
    bool? isLoading,
    bool? isSubmitting,
    bool? isCompleted,
    int? backgroundAttemptCount,
    Map<String, int>? timeSpent,
    DateTime? currentQuestionStartTime,
  }) {
    return QuizState(
      exam: exam ?? this.exam,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      answers: answers ?? this.answers,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isCompleted: isCompleted ?? this.isCompleted,
      backgroundAttemptCount: backgroundAttemptCount ?? this.backgroundAttemptCount,
      timeSpent: timeSpent ?? this.timeSpent,
      currentQuestionStartTime: currentQuestionStartTime ?? this.currentQuestionStartTime,
    );
  }

  @override
  List<Object?> get props => [
        exam,
        currentQuestionIndex,
        remainingSeconds,
        answers,
        isLoading,
        isSubmitting,
        isCompleted,
        backgroundAttemptCount,
        timeSpent,
        currentQuestionStartTime,
      ];
}

// --- Cubit ---
class QuizCubit extends Cubit<QuizState> {
  final AppDatabase _db;
  Timer? _timer;

  QuizCubit(this._db) : super(const QuizState(isLoading: true));

  void loadQuiz(QuizExam exam) {
    emit(state.copyWith(
      exam: exam,
      remainingSeconds: exam.durationMinutes * 60,
      isLoading: false,
      currentQuestionStartTime: DateTime.now(), // Start tracking first question
    ));
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.remainingSeconds > 0) {
        emit(state.copyWith(remainingSeconds: state.remainingSeconds - 1));
      } else {
        _timer?.cancel();
        submitQuiz(); // Auto-submit
      }
    });
  }

  Future<void> selectAnswer(String questionId, String option) async {
    final newAnswers = Map<String, String>.from(state.answers);
    newAnswers[questionId] = option;
    emit(state.copyWith(answers: newAnswers));

    // Persist to local DB instantly (Offline support)
    if (state.exam != null) {
      await _db.saveDraftAnswer(state.exam!.id, questionId, option);
    }
  }

  void _recordTimeSpent() {
    if (state.exam == null || state.currentQuestionStartTime == null) return;

    final currentQuestion = state.exam!.questions[state.currentQuestionIndex];
    final now = DateTime.now();
    final duration = now.difference(state.currentQuestionStartTime!).inSeconds;

    final newTimeSpent = Map<String, int>.from(state.timeSpent);
    // Add to existing time if user revisited the question
    newTimeSpent[currentQuestion.id] = (newTimeSpent[currentQuestion.id] ?? 0) + duration;

    emit(state.copyWith(
      timeSpent: newTimeSpent,
      currentQuestionStartTime: now, // Reset for next/prev question
    ));
  }

  void nextQuestion() {
    if (state.exam != null && state.currentQuestionIndex < state.exam!.questions.length - 1) {
      _recordTimeSpent();
      emit(state.copyWith(currentQuestionIndex: state.currentQuestionIndex + 1));
    }
  }

  void prevQuestion() {
    if (state.currentQuestionIndex > 0) {
      _recordTimeSpent();
      emit(state.copyWith(currentQuestionIndex: state.currentQuestionIndex - 1));
    }
  }

  void logCheatingAttempt() {
    if (state.isCompleted || state.isSubmitting) return;

    final newCount = state.backgroundAttemptCount + 1;
    emit(state.copyWith(backgroundAttemptCount: newCount));

    // Log to backend would go here (e.g., apiClient.post('/log-event', ...))

    if (newCount > 2) {
      submitQuiz(); // Auto-submit due to cheating
    }
  }

  Future<void> submitQuiz() async {
    if (state.isSubmitting || state.isCompleted) return;

    _recordTimeSpent(); // Capture time for the final question
    emit(state.copyWith(isSubmitting: true));
    _timer?.cancel();

    try {
      // Mock API call simulation
      await Future.delayed(const Duration(seconds: 2));

      // Here you would call ApiClient to submit
      // final payload = {
      //   'examId': state.exam!.id,
      //   'answers': state.answers,
      //   'timeSpent': state.timeSpent, // Sending heatmap data
      // };
      // await apiClient.post('/academic/online-exam/submit', data: payload);

      emit(state.copyWith(isSubmitting: false, isCompleted: true));
    } catch (e) {
      // Handle error (maybe local queue if offline)
      emit(state.copyWith(isSubmitting: false));
    }
  }

  @override
  Future<void> close() {
    _timer?.cancel();
    return super.close();
  }
}
