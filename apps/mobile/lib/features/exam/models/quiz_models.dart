
class QuizQuestion {
  final String id;
  final String text;
  final List<String> options;

  const QuizQuestion({
    required this.id,
    required this.text,
    required this.options,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      id: json['id'] as String,
      text: json['text'] as String,
      options: List<String>.from(json['options'] ?? []),
    );
  }
}

class QuizExam {
  final String id;
  final String title;
  final int durationMinutes;
  final List<QuizQuestion> questions;

  const QuizExam({
    required this.id,
    required this.title,
    required this.durationMinutes,
    required this.questions,
  });

  factory QuizExam.fromJson(Map<String, dynamic> json) {
    return QuizExam(
      id: json['id'] as String,
      title: json['title'] as String,
      durationMinutes: json['durationMinutes'] as int,
      questions: (json['questions'] as List<dynamic>?)
              ?.map((e) => QuizQuestion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
