enum LessonPlanStatus { PENDING, COMPLETED, OVERDUE }

class LessonPlan {
  final String id;
  final String topic;
  final String learningOutcomes;
  final DateTime plannedDate;
  final LessonPlanStatus status;
  final List<String> resourcesUrl;

  LessonPlan({
    required this.id,
    required this.topic,
    required this.learningOutcomes,
    required this.plannedDate,
    required this.status,
    this.resourcesUrl = const [],
  });

  factory LessonPlan.fromJson(Map<String, dynamic> json) {
    LessonPlanStatus status = LessonPlanStatus.PENDING;
    if (json['status'] == 'COMPLETED') status = LessonPlanStatus.COMPLETED;

    // Check overdue logic
    final planned = DateTime.parse(json['plannedDate']);
    if (status != LessonPlanStatus.COMPLETED && planned.isBefore(DateTime.now().subtract(const Duration(days: 1)))) {
       status = LessonPlanStatus.OVERDUE;
    }

    return LessonPlan(
      id: json['id'],
      topic: json['topic'],
      learningOutcomes: json['learningOutcomes'] ?? '',
      plannedDate: planned,
      status: status,
      resourcesUrl: List<String>.from(json['resourcesUrl'] ?? []),
    );
  }
}
