import 'package:flutter/material.dart';

class AdminStudentListScreen extends StatelessWidget {
  const AdminStudentListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student List'),
      ),
      body: const Center(
        child: Text('Admin Student List Screen'),
      ),
    );
  }
}
