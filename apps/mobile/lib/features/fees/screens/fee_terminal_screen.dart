import 'package:flutter/material.dart';

class FeeTerminalScreen extends StatelessWidget {
  const FeeTerminalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fee Terminal')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Search Student (Name or ID)',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (val) {},
            ),
          ),
          Expanded(
            child: Center(
              child: Card(
                margin: const EdgeInsets.all(32),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Outstanding Dues', style: TextStyle(fontSize: 24, color: Colors.grey)),
                      const SizedBox(height: 16),
                      const Text('\$1,200', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.red)),
                      const SizedBox(height: 32),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                        ),
                        onPressed: () {
                          // Open Modal
                          showModalBottomSheet(
                            context: context,
                            builder: (_) => const _FeeCollectionModal()
                          );
                        },
                        child: const Text('Collect Fee', style: TextStyle(fontSize: 20)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeeCollectionModal extends StatefulWidget {
  const _FeeCollectionModal();

  @override
  State<_FeeCollectionModal> createState() => _FeeCollectionModalState();
}

class _FeeCollectionModalState extends State<_FeeCollectionModal> {
  String _paymentMode = 'Cash';
  final List<String> _selectedHeads = [];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Collect Fee', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          CheckboxListTile(
            title: const Text('Tuition Fee'),
            value: _selectedHeads.contains('Tuition'),
            onChanged: (v) => setState(() => v! ? _selectedHeads.add('Tuition') : _selectedHeads.remove('Tuition')),
          ),
          CheckboxListTile(
            title: const Text('Transport Fee'),
            value: _selectedHeads.contains('Transport'),
            onChanged: (v) => setState(() => v! ? _selectedHeads.add('Transport') : _selectedHeads.remove('Transport')),
          ),
          const Divider(),
          DropdownButtonFormField<String>(
            value: _paymentMode,
            items: ['Cash', 'UPI', 'Card'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) => setState(() => _paymentMode = v!),
            decoration: const InputDecoration(labelText: 'Payment Mode'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // Print Receipt logic (Dummy)
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fee Collected & Receipt Printed (Dummy)')));
              },
              child: const Text('Confirm & Print'),
            ),
          ),
        ],
      ),
    );
  }
}
