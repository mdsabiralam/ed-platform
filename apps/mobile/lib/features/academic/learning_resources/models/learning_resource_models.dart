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
