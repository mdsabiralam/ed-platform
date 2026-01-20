import 'package:flutter/material.dart';

class StudentDiaryScreen extends StatelessWidget {
  const StudentDiaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Diary'),
      ),
      body: const Center(
        child: Text('Student Diary Screen'),
      ),
    );
  }
}
