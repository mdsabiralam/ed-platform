import 'package:flutter/material.dart';

class ApprovalQueueWidget extends StatefulWidget {
  const ApprovalQueueWidget({super.key});

  @override
  State<ApprovalQueueWidget> createState() => _ApprovalQueueWidgetState();
}

class _ApprovalQueueWidgetState extends State<ApprovalQueueWidget> {
  // Simulating pending requests
  final List<String> _requests = ['Student: John Doe - Transfer Certificate'];
  final List<String> _approved = [];

  void _approve(String request) async {
    // Simulate digital signing delay
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 10),
            Text("Digitally Signing...", style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
      ),
    );

    await Future.delayed(const Duration(milliseconds: 500)); // Simulate processing

    if (mounted) {
      Navigator.pop(context); // Close dialog
      setState(() {
        _requests.remove(request);
        _approved.add(request);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Signed & Approved")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.verified_user, color: Colors.blue),
                const SizedBox(width: 8),
                Text(
                  "Approval Queue (${_requests.length} Pending)",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const Divider(),
            if (_requests.isEmpty && _approved.isEmpty)
              const Text("No pending requests."),

            ..._requests.map((req) => ListTile(
              title: Text(req),
              trailing: ElevatedButton.icon(
                icon: const Icon(Icons.edit_document),
                label: const Text("Sign & Approve"),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                onPressed: () => _approve(req),
              ),
            )),

             ..._approved.map((req) => ListTile(
              title: Text(req, style: const TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey)),
              trailing: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle, color: Colors.green),
                  SizedBox(width: 4),
                  Text("Approved", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
