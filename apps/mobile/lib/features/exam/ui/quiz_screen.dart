import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/database/app_database.dart';
import '../bloc/quiz_cubit.dart';
import '../models/quiz_models.dart';

class QuizScreen extends StatelessWidget {
  final QuizExam exam;

  const QuizScreen({Key? key, required this.exam}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => QuizCubit(
        // Assuming AppDatabase is available via dependency injection or a global provider
        RepositoryProvider.of<AppDatabase>(context),
      )..loadQuiz(exam),
      child: const QuizView(),
    );
  }
}

class QuizView extends StatelessWidget {
  const QuizView({Key? key}) : super(key: key);

  String _formatTime(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<QuizCubit, QuizState>(
      listener: (context, state) {
        if (state.isCompleted) {
          // Navigate to result or home
          Navigator.of(context).pop(); // Or go to ResultScreen
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Quiz Submitted Successfully!')),
          );
        }
      },
      builder: (context, state) {
        if (state.isLoading) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        final question = state.exam!.questions[state.currentQuestionIndex];
        final totalQuestions = state.exam!.questions.length;

        return WillPopScope(
          onWillPop: () async => false, // Disable back button
          child: Scaffold(
            appBar: AppBar(
              title: Text('Time Left: ${_formatTime(state.remainingSeconds)}'),
              automaticallyImplyLeading: false, // Hide back button
              actions: [
                TextButton(
                  onPressed: () => context.read<QuizCubit>().submitQuiz(),
                  child: const Text('Submit', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
            body: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Progress
                  LinearProgressIndicator(
                    value: (state.currentQuestionIndex + 1) / totalQuestions,
                  ),
                  const SizedBox(height: 16),

                  // Question Count
                  Text(
                    'Question ${state.currentQuestionIndex + 1} / $totalQuestions',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 8),

                  // Question Text
                  Text(
                    question.text,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 24),

                  // Options
                  Expanded(
                    child: ListView.builder(
                      itemCount: question.options.length,
                      itemBuilder: (context, index) {
                        final option = question.options[index];
                        final isSelected = state.answers[question.id] == option;

                        return Card(
                          color: isSelected ? Colors.blue.shade50 : null,
                          child: RadioListTile<String>(
                            title: Text(option),
                            value: option,
                            groupValue: state.answers[question.id],
                            onChanged: (value) {
                              if (value != null) {
                                context.read<QuizCubit>().selectAnswer(question.id, value);
                              }
                            },
                          ),
                        );
                      },
                    ),
                  ),

                  // Navigation
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton(
                        onPressed: state.currentQuestionIndex > 0
                            ? () => context.read<QuizCubit>().prevQuestion()
                            : null,
                        child: const Text('Previous'),
                      ),
                      ElevatedButton(
                        onPressed: state.currentQuestionIndex < totalQuestions - 1
                            ? () => context.read<QuizCubit>().nextQuestion()
                            : () => context.read<QuizCubit>().submitQuiz(),
                        child: Text(
                          state.currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Submit',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
