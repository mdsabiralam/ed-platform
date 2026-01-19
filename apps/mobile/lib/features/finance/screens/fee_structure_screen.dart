import 'package:flutter/material.dart';

class FeeStructureSetupScreen extends StatelessWidget {
  const FeeStructureSetupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fee Configuration'),
        backgroundColor: Colors.green.shade800,
        foregroundColor: Colors.white,
        actions: [
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white)),
            child: const Text('Add New Head'),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: DropdownButtonFormField<String>(
            value: 'Class 10',
            decoration: const InputDecoration(labelText: 'Select Class', border: OutlineInputBorder()),
            items: ['Class 1', 'Class 2', 'Class 10'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (val) {},
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: 4,
            itemBuilder: (context, index) {
              final heads = ['Tuition Fee', 'Exam Fee', 'Transport Fee', 'Lab Fee'];
              final amounts = ['5000', '1000', '2000', '500'];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(heads[index]),
                  subtitle: const Text('Monthly'),
                  trailing: Text('\$${amounts[index]}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  onTap: () {}, // Edit
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    final heads = ['Tuition Fee', 'Exam Fee', 'Transport Fee', 'Lab Fee'];
    final classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Fee Matrix', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ElevatedButton(
                onPressed: () {}, // Batch Update
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade800, foregroundColor: Colors.white),
                child: const Text('Save Changes'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Table(
            border: TableBorder.all(color: Colors.grey.shade300),
            columnWidths: const {0: FixedColumnWidth(200)},
            children: [
              // Header
              TableRow(
                decoration: BoxDecoration(color: Colors.grey.shade100),
                children: [
                  const Padding(padding: EdgeInsets.all(12), child: Text('Fee Head / Class', style: TextStyle(fontWeight: FontWeight.bold))),
                  ...classes.map((c) => Padding(padding: const EdgeInsets.all(12), child: Text(c, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)))),
                ],
              ),
              // Rows
              ...heads.map((head) {
                return TableRow(
                  children: [
                    Padding(padding: const EdgeInsets.all(12), child: Text(head, style: const TextStyle(fontWeight: FontWeight.bold))),
                    ...classes.map((c) => Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: TextFormField(
                        initialValue: '5000',
                        textAlign: TextAlign.center,
                        decoration: const InputDecoration(
                          isDense: true,
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                        ),
                      ),
                    )),
                  ],
                );
              }),
            ],
          ),
        ],
      ),
    );
  }
}
