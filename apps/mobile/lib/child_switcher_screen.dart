import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class ParentChildSwitcherScreen extends StatelessWidget {
  const ParentChildSwitcherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> children = [
      {'name': 'Rahim', 'class': 'Class 10 - A', 'roll': '12'},
      {'name': 'Karim', 'class': 'Class 8 - B', 'roll': '05'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Child'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: children.length,
        itemBuilder: (context, index) {
          final child = children[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.teal.shade100,
                child: Text(
                  child['name']![0],
                  style: const TextStyle(
                    color: Colors.teal,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              title: Text(
                child['name']!,
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('${child['class']} • Roll: ${child['roll']}'),
              trailing: const Icon(
                Icons.check_circle_outline,
                color: Colors.grey,
              ),
              onTap: () {
                // Logic to switch child context would go here
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Switched to ${child['name']}')),
                );
                context.pop();
              },
            ),
          );
        },
      ),
    );
  }
}
