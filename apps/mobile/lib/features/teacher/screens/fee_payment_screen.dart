import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentFeePaymentScreen extends StatelessWidget {
  const StudentFeePaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> fees = [
      {'month': 'October 2023', 'amount': 1500, 'status': 'Pending'},
      {'month': 'September 2023', 'amount': 1500, 'status': 'Paid'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee Payment'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: fees.length,
        itemBuilder: (context, index) {
          final fee = fees[index];
          bool isPaid = fee['status'] == 'Paid';

          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(
                fee['month'],
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('Amount: \$${fee['amount']}'),
              trailing: isPaid
                  ? const Chip(
                      label: Text(
                        'Paid',
                        style: TextStyle(color: Colors.white),
                      ),
                      backgroundColor: Colors.green,
                    )
                  : ElevatedButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'Payment Gateway Integration Coming Soon!',
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                      ),
                      child: const Text('Pay Now'),
                    ),
            ),
          );
        },
      ),
    );
  }
}
