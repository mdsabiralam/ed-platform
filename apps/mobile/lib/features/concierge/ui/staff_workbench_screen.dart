import 'package:flutter/material.dart';

class StaffWorkbenchScreen extends StatelessWidget {
  const StaffWorkbenchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Workbench'),
      ),
      body: const Center(
        child: Text('Workbench Placeholder'),
      ),
    );
  }
}
