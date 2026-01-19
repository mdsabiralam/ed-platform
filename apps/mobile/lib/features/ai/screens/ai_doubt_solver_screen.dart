import 'package:flutter/material.dart';

class AiDoubtSolverScreen extends StatefulWidget {
  const AiDoubtSolverScreen({super.key});

  @override
  State<AiDoubtSolverScreen> createState() => _AiDoubtSolverScreenState();
}

class _AiDoubtSolverScreenState extends State<AiDoubtSolverScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {'text': 'Hello! I am your AI Tutor. Ask me anything from your textbooks.', 'isUser': false},
  ];
  bool _isLoading = false;

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'text': text, 'isUser': true});
      _isLoading = true;
      _controller.clear();
    });

    // Mock AI Response
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isLoading = false;
      _messages.add({
        'text': 'Here is the answer based on Chapter 5 (Page 120):\n\nPhotosynthesis is the process used by plants...',
        'isUser': false,
        'citation': 'Science Textbook, Class 10, Page 120'
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Doubt Solver'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWeb = constraints.maxWidth > 800;
          return Center(
            child: SizedBox(
              width: isWeb ? 600 : double.infinity,
              child: Column(
                children: [
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final msg = _messages[index];
                        final isUser = msg['isUser'];
                        return Align(
                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isUser ? Colors.deepPurple : Colors.grey.shade200,
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(12),
                                topRight: const Radius.circular(12),
                                bottomLeft: isUser ? const Radius.circular(12) : Radius.zero,
                                bottomRight: isUser ? Radius.zero : const Radius.circular(12),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  msg['text'],
                                  style: TextStyle(color: isUser ? Colors.white : Colors.black87),
                                ),
                                if (!isUser && msg.containsKey('citation'))
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      'Source: ${msg['citation']}',
                                      style: TextStyle(fontSize: 10, color: Colors.deepPurple.shade900, fontStyle: FontStyle.italic),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  if (_isLoading) const Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator()),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            decoration: InputDecoration(
                              hintText: 'Ask a doubt...',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            onSubmitted: (_) => _sendMessage(),
                          ),
                        ),
                        const SizedBox(width: 8),
                        FloatingActionButton(
                          onPressed: _sendMessage,
                          backgroundColor: Colors.deepPurple,
                          mini: true,
                          child: const Icon(Icons.send),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
