import 'package:flutter/material.dart';

class HomeworkStatusScreen extends StatelessWidget {
  final String homeworkId;
  const HomeworkStatusScreen({super.key, required this.homeworkId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assignment Grading'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
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
        _buildStatsHeader(),
        Expanded(
          child: ListView.builder(
            itemCount: 10,
            itemBuilder: (context, index) {
              final status = index < 5 ? 'Submitted' : (index < 8 ? 'Pending' : 'Late');
              return Card(
                child: ListTile(
                  leading: CircleAvatar(child: Text('${index + 1}')),
                  title: Text('Student ${index + 1}'),
                  subtitle: Text('Status: $status'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (status != 'Pending')
                        IconButton(icon: const Icon(Icons.grade, color: Colors.teal), onPressed: () => _showGradingDialog(context)),
                      _buildStatusBadge(status),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: Column(
            children: [
              _buildStatsHeader(),
              Expanded(
                child: ListView.builder(
                  itemCount: 10,
                  itemBuilder: (context, index) {
                    final status = index < 5 ? 'Submitted' : (index < 8 ? 'Pending' : 'Late');
                    return ListTile(
                      leading: CircleAvatar(child: Text('${index + 1}')),
                      title: Text('Student ${index + 1}'),
                      trailing: _buildStatusBadge(status),
                      onTap: () {}, // Select student
                      selected: index == 0,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 7,
          child: Column(
            children: [
              Expanded(
                child: Container(
                  color: Colors.grey.shade100,
                  child: const Center(child: Text('PDF Preview / Annotation Tool Placeholder')),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: Row(
                  children: [
                    Expanded(child: TextFormField(decoration: const InputDecoration(labelText: 'Marks (Max 100)', border: OutlineInputBorder()))),
                    const SizedBox(width: 16),
                    Expanded(child: TextFormField(decoration: const InputDecoration(labelText: 'Remarks', border: OutlineInputBorder()))),
                    const SizedBox(width: 16),
                    ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, foregroundColor: Colors.white), child: const Text('Save Grade')),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatsHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.teal.shade50,
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Text('Submitted: 5', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
          Text('Pending: 3', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          Text('Late: 2', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'Submitted': color = Colors.green; break;
      case 'Pending': color = Colors.grey; break;
      case 'Late': color = Colors.amber; break;
      default: color = Colors.blue;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Text(status, style: TextStyle(color: color, fontSize: 12)),
    );
  }

  void _showGradingDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Grade Submission'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TextField(decoration: InputDecoration(labelText: 'Marks obtained')),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Feedback')),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: () {}, child: const Text('Request Redo'))),
                const SizedBox(width: 8),
                Expanded(child: ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Submit'))),
              ],
            )
          ],
        ),
      ),
    );
  }
}
