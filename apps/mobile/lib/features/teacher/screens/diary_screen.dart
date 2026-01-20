import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentDiaryScreen extends StatelessWidget {
  const StudentDiaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> diaryEntries = [
      {
        'date': '2023-10-26',
        'subject': 'Math',
        'note': 'Complete Exercise 5.2',
      },
      {'date': '2023-10-26', 'subject': 'English', 'note': 'Read Chapter 3'},
      {
        'date': '2023-10-25',
        'subject': 'Science',
        'note': 'Draw diagram of heart',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Diary'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: diaryEntries.length,
        itemBuilder: (context, index) {
          final entry = diaryEntries[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.teal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  entry['date']!.substring(5),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.teal,
                  ),
                ),
              ),
              title: Text(
                entry['subject']!,
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(entry['note']!),
            ),
          );
        },
      ),
    );
  }
}
