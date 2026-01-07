class ChatMessage {
  final String id;
  final String text;
  final DateTime timestamp;
  final bool isMe;
  final bool isRead;
  final bool isDelivered;
  final bool isSent;

  ChatMessage({
    required this.id,
    required this.text,
    required this.timestamp,
    required this.isMe,
    this.isRead = false,
    this.isDelivered = false,
    this.isSent = true,
  });
}
