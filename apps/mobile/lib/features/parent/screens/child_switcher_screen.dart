import 'package:flutter/material.dart';

class ParentChildSwitcherScreen extends StatelessWidget {
  const ParentChildSwitcherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Switch Child'),
      ),
      body: const Center(
        child: Text('Parent Child Switcher Screen'),
      ),
    );
  }
}
