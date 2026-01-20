import 'package:flutter/material.dart';

class ParentFeeHistoryScreen extends StatelessWidget {
  const ParentFeeHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee History'),
      ),
      body: const Center(
        child: Text('Parent Fee History Screen'),
      ),
    );
  }
}
