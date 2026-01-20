import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TeacherLeaveScreen extends StatefulWidget {
  const TeacherLeaveScreen({super.key});

  @override
  State<TeacherLeaveScreen> createState() => _TeacherLeaveScreenState();
}

class _TeacherLeaveScreenState extends State<TeacherLeaveScreen> {
  final List<Map<String, String>> _leaves = [
    {'type': 'Sick Leave', 'date': '2023-09-10', 'status': 'Approved'},
    {'type': 'Casual Leave', 'date': '2023-10-05', 'status': 'Pending'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Applications'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _leaves.length,
        itemBuilder: (context, index) {
          final leave = _leaves[index];
          Color statusColor = leave['status'] == 'Approved'
              ? Colors.green
              : Colors.orange;

          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(
                leave['type']!,
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('Date: ${leave['date']}'),
              trailing: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor),
                ),
                child: Text(
                  leave['status']!,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Apply Leave Feature Coming Soon!')),
          );
        },
        label: const Text('Apply Leave'),
        icon: const Icon(Icons.add),
        backgroundColor: Colors.teal,
      ),
    );
  }
}
