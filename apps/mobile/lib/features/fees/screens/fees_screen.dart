import 'package:flutter/material.dart';

class FeesScreen extends StatefulWidget {
  final String studentId;
  const FeesScreen({super.key, required this.studentId});

  @override
  State<FeesScreen> createState() => _FeesScreenState();
}

class _FeesScreenState extends State<FeesScreen> {
  // Mock fees data
  List<Map<String, dynamic>> fees = [
    {
      'id': 'fee-1',
      'title': 'Term 1 Fee',
      'amount': 500.0,
      'status': 'PENDING',
      'dueDate': '2024-06-30'
    },
    {
      'id': 'fee-2',
      'title': 'Transport Fee',
      'amount': 150.0,
      'status': 'PAID',
      'dueDate': '2024-06-30'
    }
  ];

  bool isPaying = false;

  Future<void> _payFee(String feeId) async {
    setState(() {
      isPaying = true;
    });

    // Simulate API call to POST /fees/pay
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      final index = fees.indexWhere((f) => f['id'] == feeId);
      if (index != -1) {
        fees[index]['status'] = 'PAID';
      }
      isPaying = false;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fee Paid Successfully! Receipt Generated.')),
      );
    }
  }

  void _downloadReceipt(String feeId) {
    // Simulate generic PDF download
    print("Downloading receipt for $feeId");
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Downloading Receipt...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Fees")),
      body: ListView.builder(
        itemCount: fees.length,
        itemBuilder: (context, index) {
          final fee = fees[index];
          final isPaid = fee['status'] == 'PAID';

          return Card(
            margin: const EdgeInsets.all(10),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fee['title'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Amount: \$${fee['amount']}"),
                  Text("Due Date: ${fee['dueDate']}"),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isPaid ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          fee['status'],
                          style: TextStyle(
                            color: isPaid ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (isPaid)
                        TextButton.icon(
                          onPressed: () => _downloadReceipt(fee['id']),
                          icon: const Icon(Icons.download),
                          label: const Text("Receipt"),
                        )
                      else
                        ElevatedButton(
                          onPressed: isPaying ? null : () => _payFee(fee['id']),
                          child: isPaying
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Text("Pay Now"),
                        ),
                    ],
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
