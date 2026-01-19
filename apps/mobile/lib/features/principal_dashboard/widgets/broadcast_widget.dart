import 'package:flutter/material.dart';

class BroadcastWidget extends StatefulWidget {
  const BroadcastWidget({super.key});

  @override
  State<BroadcastWidget> createState() => _BroadcastWidgetState();
}

class _BroadcastWidgetState extends State<BroadcastWidget> {
  final TextEditingController _controller = TextEditingController();

  void _sendBroadcast() {
    if (_controller.text.isEmpty) return;

    // Simulate API call
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Sent to 500 Parents"),
        backgroundColor: Colors.green,
      ),
    );
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      color: Colors.red.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.campaign, color: Colors.red),
                const SizedBox(width: 8),
                Text(
                  "Emergency Broadcast",
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.red),
                ),
              ],
            ),
            const Divider(),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: "Message",
                hintText: "e.g., School Closed due to rain",
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.send),
                label: const Text("Send Alert"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: _sendBroadcast,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
