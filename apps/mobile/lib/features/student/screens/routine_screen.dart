import 'package:flutter/material.dart';

class StudentRoutineScreen extends StatelessWidget {
  const StudentRoutineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Routine'),
      ),
      body: const Center(
        child: Text('Student Routine Screen'),
      ),
    );
  }
}
