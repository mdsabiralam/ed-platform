class NoticeModel {
  final String id;
  final String title;
  final String content;
  final DateTime timestamp;
  final String? attachmentUrl;
  final bool isPinned;
  final bool isNew;
  final String audience; // e.g., "Class 10", "Teachers"

  NoticeModel({
    required this.id,
    required this.title,
    required this.content,
    required this.timestamp,
    this.attachmentUrl,
    this.isPinned = false,
    this.isNew = false,
    required this.audience,
  });

  factory NoticeModel.fromJson(Map<String, dynamic> json) {
    return NoticeModel(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      timestamp: DateTime.parse(json['timestamp']),
      attachmentUrl: json['attachmentUrl'],
      isPinned: json['isPinned'] ?? false,
      isNew: json['isNew'] ?? false,
      audience: json['audience'],
    );
  }
}
