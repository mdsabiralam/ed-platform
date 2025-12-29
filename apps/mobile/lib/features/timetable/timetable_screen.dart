import 'package:flutter/material.dart';

class TimetableScreen extends StatelessWidget {
  final List<dynamic> routine; // Expecting list of maps from backend

  const TimetableScreen({super.key, required this.routine});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Generated Timetable')),
      body: routine.isEmpty
          ? const Center(child: Text('No routine generated.'))
          : ListView.builder(
              itemCount: routine.length,
              itemBuilder: (context, index) {
                final entry = routine[index];

                // Using the exact keys found in the backend (TimetableProcessor)
                final subject = entry['subject'] ?? 'No Subject';
                final teacher = entry['teacher'] ?? 'No Teacher';
                final room = entry['room'] ?? 'No Room';
                final startTime = entry['startTime'] ?? '--:--';
                final endTime = entry['endTime'] ?? '--:--';
                final day = entry['day'] ?? 'UNK';

                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text(day.substring(0, 1)),
                    ),
                    title: Text(
                      subject,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.person, size: 16, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(teacher),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.access_time, size: 16, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text('$startTime - $endTime'),
                          ],
                        ),
                      ],
                    ),
                    trailing: Chip(
                      label: Text(room),
                      backgroundColor: Colors.blue.shade50,
                    ),
                  ),
                );
              },
            ),
    );
  }
}
