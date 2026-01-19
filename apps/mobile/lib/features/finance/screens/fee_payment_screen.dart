import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class FeePaymentScreen extends StatefulWidget {
  const FeePaymentScreen({super.key});

  @override
  State<FeePaymentScreen> createState() => _FeePaymentScreenState();
}

class _FeePaymentScreenState extends State<FeePaymentScreen> {
  final List<Map<String, dynamic>> _invoices = [
    {'id': 1, 'title': 'Tuition Fee - September', 'amount': 5000, 'selected': true},
    {'id': 2, 'title': 'Exam Fee', 'amount': 1000, 'selected': true},
    {'id': 3, 'title': 'Library Fine', 'amount': 50, 'selected': false},
  ];

  double get _totalAmount => _invoices.where((e) => e['selected']).fold(0, (sum, e) => sum + e['amount']);

  void _processPayment() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Payment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Total Amount: \$$_totalAmount'),
            const SizedBox(height: 16),
            const Text('Select Method:'),
            ListTile(leading: const Icon(Icons.credit_card), title: const Text('Card (Stripe)'), onTap: () => _mockSuccess(context)),
            ListTile(leading: const Icon(Icons.account_balance_wallet), title: const Text('Wallet (Razorpay)'), onTap: () => _mockSuccess(context)),
          ],
        ),
      ),
    );
  }

  void _mockSuccess(BuildContext context) {
    Navigator.pop(context); // Close Dialog
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment Successful! Receipt Sent.')));
    context.go('/student/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pay Fees'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(blurRadius: 5, color: Colors.grey.withOpacity(0.2))]),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Total: \$$_totalAmount', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ElevatedButton(
              onPressed: _totalAmount > 0 ? _processPayment : null,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              child: const Text('Pay Now'),
            ),
          ],
        ),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _invoices.length,
      itemBuilder: (context, index) {
        return _buildInvoiceCard(index);
      },
    );
  }

  Widget _buildWebLayout() {
    return Center(
      child: SizedBox(
        width: 600,
        child: ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: _invoices.length,
          itemBuilder: (context, index) {
            return _buildInvoiceCard(index);
          },
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(int index) {
    final invoice = _invoices[index];
    return Card(
      child: CheckboxListTile(
        value: invoice['selected'],
        onChanged: (val) {
          setState(() {
            invoice['selected'] = val;
          });
        },
        title: Text(invoice['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: const Text('Due Date: 10 Oct 2023'),
        secondary: Text('\$${invoice['amount']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        activeColor: Colors.green,
      ),
    );
  }
}
