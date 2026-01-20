import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/api_client.dart';

class TeacherHomeworkScreen extends StatefulWidget {
  const TeacherHomeworkScreen({super.key});

  @override
  State<TeacherHomeworkScreen> createState() => _TeacherHomeworkScreenState();
}

class _TeacherHomeworkScreenState extends State<TeacherHomeworkScreen> {
  final List<Map<String, String>> _homeworkList = [
    {
      'title': 'Math Exercise 5.1',
      'class': 'Class 10 - A',
      'date': '2023-10-25',
    },
    {
      'title': 'Physics Chapter 3',
      'class': 'Class 9 - B',
      'date': '2023-10-26',
    },
  ];
  bool _isSaving = false;
  final ApiClient _apiClient = ApiClient();

  Future<void> _saveHomework(String title, String description) async {
    setState(() => _isSaving = true);

    try {
      // API Call Simulation
      // await _apiClient.post('/homework', data: {'title': title, 'description': description});
      await Future.delayed(const Duration(seconds: 2));

      if (!mounted) return;

      setState(() {
        _homeworkList.add({
          'title': title,
          'class': 'Class 10 - A', // Dummy class
          'date': DateTime.now().toString().split(' ')[0],
        });
        _isSaving = false;
      });
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Homework Added Successfully!')),
      );
    } catch (e) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _addHomework() {
    showDialog(
      context: context,
      builder: (context) {
        String title = '';
        String description = '';
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Add Homework'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    decoration: const InputDecoration(labelText: 'Title'),
                    onChanged: (value) => title = value,
                  ),
                  TextField(
                    decoration: const InputDecoration(labelText: 'Description'),
                    onChanged: (value) => description = value,
                  ),
                ],
              ),
              actions: [
                if (_isSaving)
                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: CircularProgressIndicator(),
                  )
                else ...[
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (title.isNotEmpty) {
                        // Parent widget এর _saveHomework কল করা হচ্ছে
                        this.setState(() {
                          _isSaving = true;
                        });
                        _saveHomework(title, description).then((_) {
                          // Dialog বন্ধ হওয়ার পর স্টেট রিসেট করার প্রয়োজন নেই কারণ ডায়ালগ ডিসপোজ হয়ে যাবে
                        });
                      }
                    },
                    child: const Text('Add'),
                  ),
                ],
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Homework'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _homeworkList.length,
        itemBuilder: (context, index) {
          final homework = _homeworkList[index];
          return Card(
            elevation: 3,
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Colors.teal.shade100,
                child: const Icon(Icons.book, color: Colors.teal),
              ),
              title: Text(
                homework['title']!,
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('${homework['class']} • ${homework['date']}'),
              trailing: IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () {
                  setState(() {
                    _homeworkList.removeAt(index);
                  });
                },
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addHomework,
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add),
      ),
    );
  }
}
