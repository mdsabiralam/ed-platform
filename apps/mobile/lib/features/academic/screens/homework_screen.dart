import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeworkManagementScreen extends StatelessWidget {
  const HomeworkManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assignments'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/academic/homework/create'),
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add),
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
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _buildAssignmentCard(context, index);
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 400,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: 5,
            itemBuilder: (context, index) {
              return _buildAssignmentCard(context, index);
            },
          ),
        ),
        const VerticalDivider(width: 1),
        const Expanded(
          child: Center(
            child: Text('Select an assignment to view submissions', style: TextStyle(color: Colors.grey)),
          ),
        ),
      ],
    );
  }

  Widget _buildAssignmentCard(BuildContext context, int index) {
    final isClosed = index == 0;
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        onTap: () => context.go('/academic/homework/status/$index'),
        title: Text('Assignment ${index + 1} - Math Chapter $index'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                Chip(label: const Text('Class 10-A'), backgroundColor: Colors.teal.shade50, labelStyle: const TextStyle(fontSize: 10)),
                const SizedBox(width: 8),
                Text(isClosed ? 'Closed' : 'Due Tomorrow', style: TextStyle(color: isClosed ? Colors.grey : Colors.red)),
              ],
            ),
            const SizedBox(height: 4),
            const Text('25/40 Submitted'),
          ],
        ),
        trailing: CircularProgressIndicator(value: 0.6 + (index * 0.05), backgroundColor: Colors.grey.shade200, color: Colors.teal),
      ),
    );
  }
}
