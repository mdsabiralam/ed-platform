import 'package:flutter/material.dart';

class BroadcastComposer extends StatefulWidget {
  const BroadcastComposer({super.key});

  @override
  State<BroadcastComposer> createState() => _BroadcastComposerState();
}

class _BroadcastComposerState extends State<BroadcastComposer> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _bodyController = TextEditingController();
  final List<String> _audiences = ['Class 5', 'Class 10', 'All Parents', 'All Staff'];
  final List<String> _selectedAudiences = [];

  void _send() {
    // API Call to POST /notifications/broadcast
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Success'),
        content: const Text('Broadcast sent to 150 recipients.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Broadcast Composer')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _bodyController,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Message Body', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 20),
            const Align(alignment: Alignment.centerLeft, child: Text('Audience')),
            Wrap(
              spacing: 8.0,
              children: _audiences.map((audience) {
                final isSelected = _selectedAudiences.contains(audience);
                return FilterChip(
                  label: Text(audience),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedAudiences.add(audience);
                      } else {
                        _selectedAudiences.remove(audience);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _send,
                icon: const Icon(Icons.send),
                label: const Text('Send Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
