import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TeacherExamScreen extends StatelessWidget {
  const TeacherExamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> exams = [
      {'subject': 'Mathematics', 'date': '2023-11-10', 'time': '10:00 AM'},
      {'subject': 'Physics', 'date': '2023-11-12', 'time': '10:00 AM'},
      {'subject': 'Chemistry', 'date': '2023-11-15', 'time': '10:00 AM'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Exam Schedule'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: exams.length,
        itemBuilder: (context, index) {
          final exam = exams[index];
          return Card(
            elevation: 3,
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    exam['subject']!,
                    style: GoogleFonts.lato(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_today,
                        size: 16,
                        color: Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      Text('${exam['date']} at ${exam['time']}'),
                    ],
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
