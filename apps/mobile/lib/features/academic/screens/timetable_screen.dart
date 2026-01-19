import 'package:flutter/material.dart';

class TimetableScreen extends StatelessWidget {
  const TimetableScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Class Routine'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {}, // Toggle Edit Mode
            tooltip: 'Edit Mode',
          ),
          IconButton(
            icon: const Icon(Icons.auto_awesome),
            onPressed: () => _showAIGenerateDialog(context),
            tooltip: 'AI Generate',
          ),
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

  void _showAIGenerateDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('AI Routine Generation'),
        content: const Text('This will auto-fill empty slots based on teacher availability and subject load.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple, foregroundColor: Colors.white),
            child: const Text('Generate'),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 60,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].map((day) {
              final isSelected = day == 'Mon';
              return Container(
                margin: const EdgeInsets.only(right: 8),
                child: Chip(
                  label: Text(day),
                  backgroundColor: isSelected ? Colors.indigo : Colors.grey.shade200,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
                ),
              );
            }).toList(),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: 8,
            itemBuilder: (context, index) {
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: Text(
                    '${09 + index}:00',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  title: Text(index == 4 ? 'Break' : (index % 2 == 0 ? 'Mathematics' : 'English')),
                  subtitle: index == 4 ? null : const Text('Mr. Smith • Room 101'),
                  tileColor: index == 4 ? Colors.grey.shade100 : Colors.white,
                  trailing: index == 4 ? const Icon(Icons.coffee) : null,
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    final times = List.generate(8, (i) => '${09 + i}:00');
    final days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Table(
        border: TableBorder.all(color: Colors.grey.shade300),
        children: [
          // Header Row
          TableRow(
            decoration: BoxDecoration(color: Colors.grey.shade100),
            children: [
              const Padding(padding: EdgeInsets.all(16), child: Text('Time', style: TextStyle(fontWeight: FontWeight.bold))),
              ...days.map((d) => Padding(padding: const EdgeInsets.all(16), child: Text(d, style: const TextStyle(fontWeight: FontWeight.bold), textAlign: TextAlign.center))),
            ],
          ),
          // Data Rows
          ...times.map((time) {
            return TableRow(
              children: [
                 Padding(padding: const EdgeInsets.all(16), child: Text(time)),
                 ...days.map((day) {
                   // Mock Conflict detection logic visual
                   final isConflict = day == 'Tue' && time == '10:00';
                   return DragTarget<String>(
                     builder: (context, candidateData, rejectedData) {
                       return Container(
                         height: 80,
                         margin: const EdgeInsets.all(4),
                         decoration: BoxDecoration(
                           color: isConflict ? Colors.redAccent.withOpacity(0.2) : Colors.white,
                           border: Border.all(color: Colors.grey.shade200),
                           borderRadius: BorderRadius.circular(4),
                         ),
                         child: Center(
                           child: isConflict
                               ? const Text('Conflict!', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))
                               : const Text('Math\nRoom 101', textAlign: TextAlign.center),
                         ),
                       );
                     },
                     onAccept: (data) {}, // Handle Drop
                   );
                 }),
              ],
            );
          }),
        ],
      ),
    );
  }
}
