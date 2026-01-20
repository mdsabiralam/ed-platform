import 'package:flutter/material.dart';

class AdminStaffListScreen extends StatelessWidget {
  const AdminStaffListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff List'),
      ),
      body: const Center(
        child: Text('Admin Staff List Screen'),
      ),
    );
  }
}
