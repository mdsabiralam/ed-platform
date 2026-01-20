import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentLibraryScreen extends StatelessWidget {
  const StudentLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> books = [
      {
        'title': 'Introduction to Physics',
        'author': 'John Doe',
        'due': '2023-11-01',
      },
      {'title': 'World History', 'author': 'Jane Smith', 'due': '2023-11-05'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Library Books'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: books.length,
        itemBuilder: (context, index) {
          final book = books[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: const Icon(Icons.book, size: 40, color: Colors.teal),
              title: Text(
                book['title']!,
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('Author: ${book['author']}'),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Due Date',
                    style: TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                  Text(
                    book['due']!,
                    style: const TextStyle(
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
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
