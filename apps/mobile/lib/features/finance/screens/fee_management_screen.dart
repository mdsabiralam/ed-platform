import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/finance/screens/fee_structure_screen.dart';

class FeeManagementScreen extends StatelessWidget {
  const FeeManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee Management'),
        backgroundColor: Colors.green.shade800,
        foregroundColor: Colors.white,
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              labelColor: Colors.green,
              unselectedLabelColor: Colors.grey,
              tabs: [
                Tab(text: 'Collection (POS)'),
                Tab(text: 'Structure Setup'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildCollectionTab(context),
                  const FeeStructureSetupScreen(), // Reuse Structure Screen
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCollectionTab(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              labelText: 'Search Student Name or ID',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
              suffixIcon: Icon(Icons.qr_code_scanner),
            ),
            onSubmitted: (val) {
              // Mock Search Result
            },
          ),
          const SizedBox(height: 24),
          // Invoice Card Mock
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('John Doe (Class 10-A)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('Due: \$5,500', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
                    ],
                  ),
                  const Divider(height: 32),
                  const ListTile(title: Text('Tuition Fee (Sep)'), trailing: Text('\$5,000')),
                  const ListTile(title: Text('Late Fine'), trailing: Text('\$500')),
                  const Divider(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => _showPaymentModal(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade800,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Collect Payment', style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showPaymentModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 16, right: 16, top: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Collect Payment', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(labelText: 'Amount', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: 'Cash',
              items: ['Cash', 'Online', 'Cheque'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (val) {},
              decoration: const InputDecoration(labelText: 'Mode', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment Successful')));
                  // Generate Receipt Logic
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade800, foregroundColor: Colors.white),
                child: const Text('Confirm'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
