class Notice {
  final String id;
  final String title;
  final String content;
  final String? attachmentUrl;
  final bool isPinned;
  final DateTime expiryDate;
  final DateTime publishedAt;
  final Map<String, dynamic> targetAudience;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    this.attachmentUrl,
    required this.isPinned,
    required this.expiryDate,
    required this.publishedAt,
    required this.targetAudience,
  });

  factory Notice.fromJson(Map<String, dynamic> json) {
    return Notice(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      attachmentUrl: json['attachmentUrl'],
      isPinned: json['isPinned'] ?? false,
      expiryDate: DateTime.parse(json['expiryDate']),
      publishedAt: DateTime.parse(json['publishedAt']),
      targetAudience: json['targetAudience'] ?? {},
    );
  }

  bool get isNew => DateTime.now().difference(publishedAt).inHours < 24;
}
