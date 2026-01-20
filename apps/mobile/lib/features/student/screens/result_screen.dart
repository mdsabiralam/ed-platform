import 'package:flutter/material.dart';

class StudentResultScreen extends StatelessWidget {
  const StudentResultScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Result'),
      ),
      body: const Center(
        child: Text('Student Result Screen'),
      ),
    );
  }
}
