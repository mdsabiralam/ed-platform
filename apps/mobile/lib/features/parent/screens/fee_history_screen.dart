import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class FeeHistoryScreen extends StatelessWidget {
  const FeeHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Fee Payments'),
          backgroundColor: Colors.indigo,
          foregroundColor: Colors.white,
          bottom: const TabBar(
            labelColor: Colors.white,
            indicatorColor: Colors.white,
            tabs: [
              Tab(text: 'Due'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _DueTab(),
            _HistoryTab(),
          ],
        ),
      ),
    );
  }
}

class _DueTab extends StatefulWidget {
  const _DueTab();

  @override
  State<_DueTab> createState() => _DueTabState();
}

class _DueTabState extends State<_DueTab> {
  // Mock Data
  final List<Map<String, dynamic>> _invoices = [
    {'id': 1, 'title': 'Tuition Fee - Oct', 'amount': 5000, 'selected': false},
    {'id': 2, 'title': 'Bus Fee - Oct', 'amount': 2000, 'selected': false},
  ];

  double get _total => _invoices.where((e) => e['selected']).fold(0, (sum, e) => sum + e['amount']);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _invoices.length,
            itemBuilder: (context, index) {
              final inv = _invoices[index];
              return Card(
                child: CheckboxListTile(
                  value: inv['selected'],
                  onChanged: (val) => setState(() => inv['selected'] = val),
                  title: Text(inv['title']),
                  subtitle: Text('Due: 15 Oct'),
                  secondary: Text('\$${inv['amount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  activeColor: Colors.green,
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 5)]),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total: \$$_total', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ElevatedButton(
                onPressed: _total > 0 ? () => _pay(context) : null,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                child: const Text('Pay Now'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _pay(BuildContext context) {
    // Navigate to Payment Screen (Reusing Student's FeePaymentScreen logic or dedicated)
    // For now, mock success
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Redirecting to Payment Gateway...')));
  }
}

class _HistoryTab extends StatelessWidget {
  const _HistoryTab();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            leading: const Icon(Icons.receipt_long, color: Colors.indigo),
            title: Text('Payment #${1000 + index}'),
            subtitle: const Text('Paid on 10 Sep • Online'),
            trailing: IconButton(
              icon: const Icon(Icons.download),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading Receipt...')));
              },
            ),
          ),
        );
      },
    );
  }
}
