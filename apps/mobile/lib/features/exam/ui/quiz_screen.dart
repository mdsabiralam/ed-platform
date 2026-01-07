import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

class QuizScreen extends StatefulWidget {
  final String quizId;
  final bool isExamMode; // Logic for Exam vs Practice

  const QuizScreen({super.key, required this.quizId, this.isExamMode = false});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  final FlutterTts _flutterTts = FlutterTts();
  int _currentQuestionIndex = 0;

  // Mock Data
  final List<Map<String, dynamic>> _questions = [
    {'q': 'What is 2 + 2?', 'options': ['3', '4', '5'], 'ans': '4'},
    {'q': 'Capital of France?', 'options': ['London', 'Berlin', 'Paris'], 'ans': 'Paris'},
  ];

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  void _initTts() async {
      await _flutterTts.setLanguage("en-US");
  }

  void _handleAnswer(String selected) async {
    bool isCorrect = selected == _questions[_currentQuestionIndex]['ans'];

    if (!widget.isExamMode) {
        // Gamification TTS Feedback
        if (isCorrect) {
            await _flutterTts.speak("Great job! That is correct.");
        } else {
            await _flutterTts.speak("Oh no, try again!");
        }
    } else {
        // Exam Mode: No immediate feedback
        // Could save answer silently
    }

    // Move next after delay
    if (!widget.isExamMode && !isCorrect) return; // Retry allowed in practice

    await Future.delayed(const Duration(seconds: 1));
    if (_currentQuestionIndex < _questions.length - 1) {
        setState(() {
            _currentQuestionIndex++;
        });
    } else {
        // Finish
        if (!widget.isExamMode) _flutterTts.speak("Quiz completed!");
        Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestionIndex];

    return Scaffold(
      appBar: AppBar(title: Text(widget.isExamMode ? "Exam" : "Practice Quiz")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
                Text("Question ${_currentQuestionIndex + 1}/${_questions.length}", style: const TextStyle(fontSize: 18, color: Colors.grey)),
                const SizedBox(height: 16),
                Text(question['q'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 32),
                ... (question['options'] as List<String>).map((opt) =>
                    Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: ElevatedButton(
                            onPressed: () => _handleAnswer(opt),
                            child: Text(opt, style: const TextStyle(fontSize: 18)),
                        ),
                    )
                )
            ],
        ),
      ),
    );
  }
}
