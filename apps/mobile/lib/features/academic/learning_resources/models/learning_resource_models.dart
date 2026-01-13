enum ResourceType { VIDEO, PDF, WEB_LINK, AUDIO }

class AcademicClass {
  final String id;
  final String name;
  AcademicClass({required this.id, required this.name});
}

class Subject {
  final String id;
  final String name;
  Subject({required this.id, required this.name});
}

class Chapter {
  final String id;
  final String name;
  Chapter({required this.id, required this.name});
}

class Topic {
  final String id;
  final String name;
  Topic({required this.id, required this.name});
}

class LearningResource {
  final String id;
  final String title;
  final String? description;
  final ResourceType type;
  final String url;
  final String? thumbnailUrl;
  final DateTime createdAt;

  LearningResource({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    required this.url,
    this.thumbnailUrl,
    required this.createdAt,
  });

  factory LearningResource.fromJson(Map<String, dynamic> json) {
    return LearningResource(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: ResourceType.values.firstWhere(
          (e) => e.toString().split('.').last == json['type'],
          orElse: () => ResourceType.WEB_LINK),
      url: json['url'],
      thumbnailUrl: json['thumbnailUrl'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
