import 'package:flutter/material.dart';

// Placeholder for message model
class ChatMessage {
  final String sender;
  final String content;
  final DateTime timestamp;
  final bool isMe;

  ChatMessage({
    required this.sender,
    required this.content,
    required this.timestamp,
    required this.isMe,
  });
}

class ClassroomChatWidget extends StatefulWidget {
  final String sectionId;
  final String studentId; // To identify current user

  const ClassroomChatWidget({
    super.key,
    required this.sectionId,
    required this.studentId,
  });

  @override
  State<ClassroomChatWidget> createState() => _ClassroomChatWidgetState();
}

class _ClassroomChatWidgetState extends State<ClassroomChatWidget> {
  final TextEditingController _messageController = TextEditingController();

  // Mock List for now (Replace with Firestore stream)
  final List<ChatMessage> _messages = [
    ChatMessage(
      sender: 'Teacher',
      content: 'Welcome to the class! Please check the syllabus.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
      isMe: false,
    ),
    ChatMessage(
      sender: 'Student 1',
      content: 'Is this the correct room?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      isMe: false,
    ),
  ];

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _messages.add(
        ChatMessage(
          sender: 'Me',
          content: _messageController.text,
          timestamp: DateTime.now(),
          isMe: true,
        ),
      );
    });
    _messageController.clear();
    // TODO: Push to Firestore using widget.sectionId
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Chat Header
        Container(
          padding: const EdgeInsets.all(12),
          color: Colors.blueAccent.withOpacity(0.1),
          child: Row(
            children: [
              const Icon(Icons.chat_bubble_outline, size: 20),
              const SizedBox(width: 8),
              Text(
                'Classroom Chat (${widget.sectionId})',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),

        // Messages List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              return Align(
                alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: msg.isMe ? Colors.blueAccent : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (!msg.isMe)
                        Text(
                          msg.sender,
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      Text(
                        msg.content,
                        style: TextStyle(
                          color: msg.isMe ? Colors.white : Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // Input Area
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  decoration: const InputDecoration(
                    hintText: 'Type a message...',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.send, color: Colors.blueAccent),
                onPressed: _sendMessage,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
