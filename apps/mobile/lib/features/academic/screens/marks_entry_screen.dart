import 'package:flutter/material.dart';

class MarksEntryScreen extends StatefulWidget {
  const MarksEntryScreen({super.key});

  @override
  State<MarksEntryScreen> createState() => _MarksEntryScreenState();
}

class _MarksEntryScreenState extends State<MarksEntryScreen> {
  // Mock Data
  final List<Map<String, dynamic>> _students = List.generate(20, (index) => {
    'id': index,
    'name': 'Student ${index + 1}',
    'roll': index + 1,
    'theory': '',
    'practical': '',
    'absent': false,
  });

  void _saveAll() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Marks Saved Successfully!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Marks Entry'),
            Text('Mid-Term • Class 10 • Math (Max: 100)', style: TextStyle(fontSize: 12)),
          ],
        ),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          TextButton(onPressed: _saveAll, child: const Text('Save All', style: TextStyle(color: Colors.white))),
        ],
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
      itemCount: _students.length,
      itemBuilder: (context, index) {
        final student = _students[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${student['roll']}. ${student['name']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        Checkbox(
                          value: student['absent'],
                          onChanged: (v) => setState(() {
                            student['absent'] = v;
                            if(v!) { student['theory'] = '0'; student['practical'] = '0'; }
                          }),
                        ),
                        const Text('Absent'),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        initialValue: student['theory'],
                        enabled: !student['absent'],
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Theory (70)', border: OutlineInputBorder()),
                        onChanged: (v) => student['theory'] = v,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        initialValue: student['practical'],
                        enabled: !student['absent'],
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Practical (30)', border: OutlineInputBorder()),
                        onChanged: (v) => student['practical'] = v,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Table(
        border: TableBorder.all(color: Colors.grey.shade300),
        columnWidths: const {
          0: FixedColumnWidth(80),
          1: FlexColumnWidth(),
          2: FixedColumnWidth(150),
          3: FixedColumnWidth(150),
          4: FixedColumnWidth(100),
          5: FixedColumnWidth(100),
        },
        children: [
          TableRow(
            decoration: BoxDecoration(color: Colors.teal.shade50),
            children: const [
              Padding(padding: EdgeInsets.all(12), child: Text('Roll', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(12), child: Text('Name', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(12), child: Text('Theory', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(12), child: Text('Practical', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(12), child: Text('Total', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(12), child: Text('Absent', style: TextStyle(fontWeight: FontWeight.bold))),
            ],
          ),
          ..._students.map((student) {
            return TableRow(
              children: [
                Padding(padding: const EdgeInsets.all(12), child: Text(student['roll'].toString())),
                Padding(padding: const EdgeInsets.all(12), child: Text(student['name'])),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    key: ValueKey('t_${student['id']}'),
                    initialValue: student['theory'],
                    enabled: !student['absent'],
                    decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                    onChanged: (v) => setState(() => student['theory'] = v),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    key: ValueKey('p_${student['id']}'),
                    initialValue: student['practical'],
                    enabled: !student['absent'],
                    decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 8)),
                    onChanged: (v) => setState(() => student['practical'] = v),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    ((double.tryParse(student['theory']) ?? 0) + (double.tryParse(student['practical']) ?? 0)).toString(),
                  ),
                ),
                Checkbox(
                  value: student['absent'],
                  onChanged: (v) => setState(() {
                    student['absent'] = v;
                    if(v!) { student['theory'] = '0'; student['practical'] = '0'; }
                  }),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }
}
