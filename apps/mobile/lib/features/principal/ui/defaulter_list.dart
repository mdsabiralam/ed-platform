import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DefaulterList extends StatelessWidget {
  const DefaulterList({super.key});

  Future<void> _callParent(String phone) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Mock data
    final defaulters = [
      {'name': 'John Doe', 'class': '10-A', 'amount': 5000, 'phone': '1234567890'},
      {'name': 'Jane Smith', 'class': '8-B', 'amount': 3000, 'phone': '0987654321'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Fee Defaulters')),
      body: ListView.builder(
        itemCount: defaulters.length,
        itemBuilder: (context, index) {
          final item = defaulters[index];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ListTile(
              title: Text(item['name'] as String),
              subtitle: Text('Class: ${item['class']} • Due: \$${item['amount']}'),
              trailing: IconButton(
                icon: const Icon(Icons.phone, color: Colors.green),
                onPressed: () => _callParent(item['phone'] as String),
              ),
            ),
          );
        },
      ),
    );
  }
}
