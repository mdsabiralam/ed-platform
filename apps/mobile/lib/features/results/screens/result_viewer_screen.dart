import 'dart:ui';
import 'package:flutter/material.dart';

class ResultViewerScreen extends StatefulWidget {
  const ResultViewerScreen({super.key});

  @override
  State<ResultViewerScreen> createState() => _ResultViewerScreenState();
}

class _ResultViewerScreenState extends State<ResultViewerScreen> {
  // Simulating fee due
  final bool _feeDue = true;
  String _selectedTerm = 'Half-Yearly';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Digital Marksheet')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: DropdownButtonFormField<String>(
              value: _selectedTerm,
              items: ['Half-Yearly', 'Annual'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => _selectedTerm = v!),
              decoration: const InputDecoration(labelText: 'Select Exam Term', border: OutlineInputBorder()),
            ),
          ),
          Expanded(
            child: Stack(
              children: [
                _buildMarksTable(),
                if (_feeDue)
                  BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                    child: Container(
                      color: Colors.black.withOpacity(0.1),
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.lock, size: 64, color: Colors.red),
                          const SizedBox(height: 16),
                          const Text('Results Locked due to Outstanding Fees', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              // Navigate to Fees
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Redirecting to Payment...')));
                            },
                            child: const Text('Pay Fees to View'),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (!_feeDue)
            Padding(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download),
                label: const Text('Download PDF'),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMarksTable() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Subject')),
          DataColumn(label: Text('Marks')),
          DataColumn(label: Text('Grade')),
        ],
        rows: const [
          DataRow(cells: [DataCell(Text('Mathematics')), DataCell(Text('95')), DataCell(Text('A+'))]),
          DataRow(cells: [DataCell(Text('Science')), DataCell(Text('88')), DataCell(Text('A'))]),
          DataRow(cells: [DataCell(Text('English')), DataCell(Text('92')), DataCell(Text('A+'))]),
          DataRow(cells: [DataCell(Text('History')), DataCell(Text('75')), DataCell(Text('B'))]),
        ],
      ),
    );
  }
}
