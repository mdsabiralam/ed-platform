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
        RepositoryProvider.of<AppDatabase>(context),
      )..loadQuiz(exam),
      child: const QuizView(),
    );
  }
}

class QuizView extends StatefulWidget {
  const QuizView({Key? key}) : super(key: key);

  @override
  State<QuizView> createState() => _QuizViewState();
}

class _QuizViewState extends State<QuizView> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      // User switched apps or minimized
      context.read<QuizCubit>().logCheatingAttempt();
    }
  }

  String _formatTime(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void _showCheatingWarning(BuildContext context, int count) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Warning!'),
        content: Text(
          'App switching detected! This is considered cheating.\n'
          'Attempt $count/3.\n\n'
          'If this happens more than 2 times, your exam will be auto-submitted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('I Understand'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<QuizCubit, QuizState>(
      listenWhen: (previous, current) {
        return previous.isCompleted != current.isCompleted ||
               previous.backgroundAttemptCount != current.backgroundAttemptCount;
      },
      listener: (context, state) {
        if (state.isCompleted) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Quiz Submitted Successfully!')),
          );
        } else if (state.backgroundAttemptCount > 0 && !state.isSubmitting) {
          // Show warning if not yet auto-submitting
          if (state.backgroundAttemptCount <= 2) {
             _showCheatingWarning(context, state.backgroundAttemptCount);
          }
        }
      },
      builder: (context, state) {
        if (state.isLoading) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        final question = state.exam!.questions[state.currentQuestionIndex];
        final totalQuestions = state.exam!.questions.length;

        return WillPopScope(
          onWillPop: () async => false,
          child: Scaffold(
            appBar: AppBar(
              title: Text('Time Left: ${_formatTime(state.remainingSeconds)}'),
              automaticallyImplyLeading: false,
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
                  LinearProgressIndicator(
                    value: (state.currentQuestionIndex + 1) / totalQuestions,
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Question ${state.currentQuestionIndex + 1} / $totalQuestions',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 8),

                  Text(
                    question.text,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 24),

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
