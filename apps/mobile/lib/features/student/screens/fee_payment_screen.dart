import 'package:flutter/material.dart';

class StudentFeePaymentScreen extends StatelessWidget {
  const StudentFeePaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee Payment'),
      ),
      body: const Center(
        child: Text('Student Fee Payment Screen'),
      ),
    );
  }
}
