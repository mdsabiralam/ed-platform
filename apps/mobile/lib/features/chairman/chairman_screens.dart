import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

// Mocks
class FinanceClient {
    Future<Map<String, dynamic>> getOverview() async {
        return {'collected': 500000, 'due': 120000, 'expenses': 350000};
    }
    Future<List<dynamic>> getInvoices() async {
        return [];
    }
}

// 5. Chairman's Dashboard (Financial Overview)
class ChairmanHomeScreen extends StatefulWidget {
    const ChairmanHomeScreen({super.key});

    @override
    State<ChairmanHomeScreen> createState() => _ChairmanHomeScreenState();
}

class _ChairmanHomeScreenState extends State<ChairmanHomeScreen> {
    final FinanceClient _client = FinanceClient();
    Map<String, dynamic> _data = {};

    @override
    void initState() {
        super.initState();
        _loadData();
    }

    Future<void> _loadData() async {
        final data = await _client.getOverview();
        setState(() => _data = data);
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Chairman Dashboard')),
            body: Column(
                children: [
                    // 6. Renewal Alert Banner (Injected if needed)
                    // Logic would go here or in a wrapper
                    const RenewalAlertBanner(expiryDate: '2025-06-01'),

                    Expanded(
                        child: GridView.count(
                            crossAxisCount: 2,
                            padding: const EdgeInsets.all(16),
                            children: [
                                _buildCard('Fees Collected', _data['collected'] ?? 0, Colors.green),
                                _buildCard('Outstanding Dues', _data['due'] ?? 0, Colors.orange),
                                _buildCard('Monthly Expenses', _data['expenses'] ?? 0, Colors.red),
                            ],
                        ),
                    ),
                    ListTile(
                        title: const Text('View Subscription History'),
                        trailing: const Icon(Icons.arrow_forward),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionHistoryScreen())),
                    ),
                ],
            ),
        );
    }

    Widget _buildCard(String title, num value, Color color) {
        return Card(
            color: color.withOpacity(0.1),
            child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                        Text(title, textAlign: TextAlign.center, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        Text('\$${value.toStringAsFixed(2)}', style: TextStyle(fontSize: 24, color: color, fontWeight: FontWeight.bold)),
                    ],
                ),
            ),
        );
    }
}

// 6. Renewal Alert Banner
class RenewalAlertBanner extends StatelessWidget {
    final String expiryDate;
    const RenewalAlertBanner({super.key, required this.expiryDate});

    @override
    Widget build(BuildContext context) {
        final expiry = DateTime.parse(expiryDate); // In real app, proper parsing
        final daysLeft = expiry.difference(DateTime.now()).inDays;

        if (daysLeft > 15) return const SizedBox.shrink();

        return MaterialBanner(
            content: Text('Your license expires in $daysLeft days. Renew now.'),
            backgroundColor: Colors.yellow[100],
            actions: [
                TextButton(
                    onPressed: () {
                         // Link to Billing
                    },
                    child: const Text('PAY NOW'),
                ),
            ],
        );
    }
}

// 7. SaaS Invoices Screen
class SubscriptionHistoryScreen extends StatefulWidget {
    const SubscriptionHistoryScreen({super.key});

    @override
    State<SubscriptionHistoryScreen> createState() => _SubscriptionHistoryScreenState();
}

class _SubscriptionHistoryScreenState extends State<SubscriptionHistoryScreen> {
    final FinanceClient _client = FinanceClient();
    List<dynamic> _invoices = [];

    @override
    void initState() {
        super.initState();
        // Mock data
        _invoices = [
            {'date': '2025-05-01', 'amount': 199.00, 'invoiceNo': 'INV-001', 'url': 'https://example.com/invoice1.pdf'},
            {'date': '2025-04-01', 'amount': 199.00, 'invoiceNo': 'INV-002', 'url': 'https://example.com/invoice2.pdf'},
        ];
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: const Text('Subscription History')),
            body: ListView.builder(
                itemCount: _invoices.length,
                itemBuilder: (context, index) {
                    final invoice = _invoices[index];
                    return ListTile(
                        leading: const Icon(Icons.receipt),
                        title: Text('Invoice #${invoice['invoiceNo']}'),
                        subtitle: Text('${invoice['date']} - \$${invoice['amount']}'),
                        onTap: () async {
                             final url = Uri.parse(invoice['url']);
                             if (await canLaunchUrl(url)) {
                                 await launchUrl(url);
                             }
                        },
                    );
                },
            ),
        );
    }
}
