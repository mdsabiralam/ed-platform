import 'package:flutter/material.dart';

class StudentLibraryScreen extends StatelessWidget {
  const StudentLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Library'),
      ),
      body: const Center(
        child: Text('Student Library Screen'),
      ),
    );
  }
}
