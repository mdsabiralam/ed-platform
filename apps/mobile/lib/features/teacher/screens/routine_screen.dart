import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentRoutineScreen extends StatelessWidget {
  const StudentRoutineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> routine = [
      {'time': '09:00 - 09:45', 'subject': 'Mathematics', 'teacher': 'Mr. A'},
      {'time': '09:45 - 10:30', 'subject': 'Physics', 'teacher': 'Mr. B'},
      {'time': '10:30 - 11:15', 'subject': 'Chemistry', 'teacher': 'Ms. C'},
      {'time': '11:15 - 11:45', 'subject': 'Break', 'teacher': '-'},
      {'time': '11:45 - 12:30', 'subject': 'English', 'teacher': 'Mrs. D'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Class Routine'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: routine.length,
        itemBuilder: (context, index) {
          final item = routine[index];
          bool isBreak = item['subject'] == 'Break';

          return Card(
            color: isBreak ? Colors.grey[200] : Colors.white,
            elevation: isBreak ? 0 : 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: Icon(
                Icons.access_time,
                color: isBreak ? Colors.grey : Colors.teal,
              ),
              title: Text(
                item['subject']!,
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.bold,
                  color: isBreak ? Colors.grey[700] : Colors.black,
                ),
              ),
              subtitle: Text('${item['time']} • ${item['teacher']}'),
              trailing: isBreak
                  ? null
                  : const Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: Colors.grey,
                    ),
            ),
          );
        },
      ),
    );
  }
}
