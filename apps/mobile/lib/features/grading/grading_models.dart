class GradingLogic {
  final String id;
  final String label;
  final double? minScore;
  final double? maxScore;
  final double gradePoint;

  GradingLogic({
    required this.id,
    required this.label,
    this.minScore,
    this.maxScore,
    required this.gradePoint,
  });

  factory GradingLogic.fromJson(Map<String, dynamic> json) {
    return GradingLogic(
      id: json['id'],
      label: json['label'],
      minScore: json['minScore'] != null ? (json['minScore'] as num).toDouble() : null,
      maxScore: json['maxScore'] != null ? (json['maxScore'] as num).toDouble() : null,
      gradePoint: (json['gradePoint'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'minScore': minScore,
      'maxScore': maxScore,
      'gradePoint': gradePoint,
    };
  }
}

class GradingScale {
  final String id;
  final String name;
  final bool isMarksBased;
  final String? tenantId;
  final List<GradingLogic> gradingLogics;

  GradingScale({
    required this.id,
    required this.name,
    required this.isMarksBased,
    this.tenantId,
    required this.gradingLogics,
  });

  factory GradingScale.fromJson(Map<String, dynamic> json) {
    return GradingScale(
      id: json['id'],
      name: json['name'],
      isMarksBased: json['isMarksBased'],
      tenantId: json['tenantId'],
      gradingLogics: (json['gradingLogics'] as List)
          .map((i) => GradingLogic.fromJson(i))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'isMarksBased': isMarksBased,
      'tenantId': tenantId,
      'gradingLogics': gradingLogics.map((l) => l.toJson()).toList(),
    };
  }
}
