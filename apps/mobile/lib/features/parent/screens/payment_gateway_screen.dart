import 'package:flutter/material.dart';

class ParentPaymentGatewayScreen extends StatelessWidget {
  const ParentPaymentGatewayScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Gateway'),
        backgroundColor: const Color(0xFF1A237E),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.payment, size: 64, color: Colors.indigo),
            const SizedBox(height: 16),
            const Text(
              'Payment Gateway Integration',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'This module is under development.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Placeholder for payment logic
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payment simulation initiated')),
                );
              },
              child: const Text('Initiate Payment'),
            ),
          ],
        ),
      ),
    );
  }
}
