import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  final String chatName;
  const ChatScreen({super.key, required this.chatName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final List<String> _messages = []; // Mock messages

  bool get _isQuietHours {
    final now = TimeOfDay.now();
    // 10 PM = 22:00, 6 AM = 06:00
    // Logic: if hour >= 22 OR hour < 6
    return now.hour >= 22 || now.hour < 6;
  }

  void _sendMessage() {
    if (_msgCtrl.text.trim().isEmpty) return;

    // Abuse filter check (mock)
    if (_msgCtrl.text.toLowerCase().contains('badword')) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Message blocked: Inappropriate content')));
       return;
    }

    if (_isQuietHours) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Quiet Hours: Message will be delivered at 6 AM'),
          backgroundColor: Colors.orange,
        ),
      );
    }

    setState(() {
      _messages.add(_msgCtrl.text);
      _msgCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.chatName, style: const TextStyle(color: Colors.white)), // Privacy Masking (Name only)
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: const Icon(Icons.flag, color: Colors.white),
            onPressed: () {
               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User reported')));
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isQuietHours)
            Container(
              color: Colors.orange.shade100,
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              child: const Text(
                'Quiet Hours (10 PM - 6 AM). Notifications are muted.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.deepOrange),
              ),
            ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                // Mocking sender (Me)
                return Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.teal.shade100, // My Bubble
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(_messages[index], style: const TextStyle(color: Colors.teal)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.teal),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
