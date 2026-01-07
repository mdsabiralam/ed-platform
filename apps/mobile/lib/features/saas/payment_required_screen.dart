import 'package:flutter/material.dart';

class PaymentRequiredScreen extends StatelessWidget {
  const PaymentRequiredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription Expired')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.payment, size: 64, color: Colors.orange),
              const SizedBox(height: 24),
              const Text(
                'Payment Required',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Text(
                'Your subscription has expired. Please renew your plan to continue accessing the platform.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  // Navigate to external payment portal or contact support
                },
                child: const Text('Renew Subscription'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
