import 'package:flutter/material.dart';

class GradingScreen extends StatelessWidget {
  const GradingScreen({super.key});

  @override
  Widget build(BuildContext context) {
      // Mock Students
      final submissions = [
          {'name': 'John Doe', 'status': 'SUBMITTED', 'marks': null},
          {'name': 'Jane Smith', 'status': 'LATE', 'marks': null},
          {'name': 'Bob Wilson', 'status': 'MISSING', 'marks': null},
          {'name': 'Alice Brown', 'status': 'GRADED', 'marks': 95},
      ];

    return Scaffold(
      appBar: AppBar(title: const Text('Grading: Algebra 101')),
      body: ListView.separated(
        itemCount: submissions.length,
        separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (context, index) {
            final sub = submissions[index];
            return ListTile(
                leading: CircleAvatar(child: Text(sub['name'].toString().substring(0,1))),
                title: Text(sub['name'].toString()),
                subtitle: Text(sub['status'].toString(), style: TextStyle(
                    color: _getStatusColor(sub['status'].toString())
                )),
                trailing: sub['status'] == 'GRADED'
                    ? Text('${sub['marks']}/100', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))
                    : const Icon(Icons.chevron_right),
                onTap: () {
                    showDialog(context: context, builder: (_) => GradingDialog(studentName: sub['name'].toString()));
                },
            );
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
      switch(status) {
          case 'SUBMITTED': return Colors.blue;
          case 'LATE': return Colors.orange;
          case 'MISSING': return Colors.red;
          case 'GRADED': return Colors.green;
          default: return Colors.grey;
      }
  }
}

class GradingDialog extends StatelessWidget {
    final String studentName;
    const GradingDialog({super.key, required this.studentName});

    @override
    Widget build(BuildContext context) {
        return AlertDialog(
            title: Text('Grade $studentName'),
            content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    TextFormField(
                        decoration: const InputDecoration(labelText: 'Marks (out of 100)'),
                        keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                        decoration: const InputDecoration(labelText: 'Feedback'),
                        maxLines: 3,
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton(onPressed: (){}, child: const Text('View Submission File'))
                ],
            ),
            actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Save Grade')),
            ],
        );
    }
}
