import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ParentFeeHistoryScreen extends StatelessWidget {
  const ParentFeeHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> history = [
      {
        'month': 'September 2023',
        'amount': 1500,
        'date': '2023-09-05',
        'status': 'Paid',
      },
      {
        'month': 'August 2023',
        'amount': 1500,
        'date': '2023-08-02',
        'status': 'Paid',
      },
      {
        'month': 'July 2023',
        'amount': 1500,
        'date': '2023-07-05',
        'status': 'Paid',
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee History'),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: history.length,
        itemBuilder: (context, index) {
          final item = history[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(
                item['month'],
                style: GoogleFonts.lato(fontWeight: FontWeight.bold),
              ),
              subtitle: Text('Paid on: ${item['date']}'),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${item['amount']}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    item['status'],
                    style: const TextStyle(color: Colors.green, fontSize: 12),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
