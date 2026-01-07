import 'package:flutter/material.dart';

class FinancialPulse extends StatefulWidget {
  const FinancialPulse({super.key});

  @override
  State<FinancialPulse> createState() => _FinancialPulseState();
}

class _FinancialPulseState extends State<FinancialPulse> {
  bool _isLocked = true;
  double _todayCollection = 0;
  double _monthRevenue = 0;

  Future<void> _unlock() async {
    final pin = await showDialog<String>(
      context: context,
      builder: (context) {
        String input = '';
        return AlertDialog(
          title: const Text('Enter PIN'),
          content: TextField(
            obscureText: true,
            maxLength: 4,
            keyboardType: TextInputType.number,
            onChanged: (val) => input = val,
            decoration: const InputDecoration(hintText: '****'),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            TextButton(onPressed: () => Navigator.pop(context, input), child: const Text('Unlock')),
          ],
        );
      },
    );

    if (pin == '1234') { // Mock PIN check
      setState(() {
        _isLocked = false;
        _todayCollection = 50000;
        _monthRevenue = 1200000;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isLocked ? _unlock : null,
      child: Card(
        color: _isLocked ? Colors.grey[300] : Colors.white,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          child: _isLocked
              ? const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.lock, size: 40, color: Colors.grey),
                    SizedBox(height: 10),
                    Text('Financial Pulse Locked', style: TextStyle(color: Colors.grey)),
                    Text('Tap to Unlock', style: TextStyle(fontWeight: FontWeight.bold)),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Financial Pulse', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _stat('Today\'s Collection', '\$${_todayCollection.toStringAsFixed(0)}'),
                        _stat('MTD Revenue', '\$${_monthRevenue.toStringAsFixed(0)}'),
                      ],
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
