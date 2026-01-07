import 'package:flutter/material.dart';

class SubstitutionView extends StatefulWidget {
  const SubstitutionView({super.key});

  @override
  State<SubstitutionView> createState() => _SubstitutionViewState();
}

class _SubstitutionViewState extends State<SubstitutionView> {
  // Mock data
  final List<Map<String, dynamic>> _absentTeachers = [
    {
      'id': '1',
      'name': 'Mr. Brown',
      'schedule': [
        {'period': 1, 'class': '5-A', 'subject': 'Math'},
        {'period': 3, 'class': '6-B', 'subject': 'Math'},
      ]
    },
  ];

  final List<String> _freeTeachers = ['Mrs. Green', 'Mr. White', 'Ms. Black'];

  void _assignSubstitute(String period, String originalTeacher) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return ListView(
          children: _freeTeachers.map((teacher) => ListTile(
            title: Text(teacher),
            subtitle: const Text('Available'),
            onTap: () {
              // API Call to assign
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Assigned $teacher for $originalTeacher')),
              );
            },
          )).toList(),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Substitution Manager')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _absentTeachers.length,
        itemBuilder: (context, index) {
          final teacher = _absentTeachers[index];
          final schedule = teacher['schedule'] as List;

          return Card(
            child: ExpansionTile(
              title: Text('${teacher['name']} (Absent)'),
              subtitle: Text('${schedule.length} classes pending'),
              initiallyExpanded: true,
              children: schedule.map<Widget>((cls) {
                return ListTile(
                  title: Text('Period ${cls['period']}: ${cls['class']} - ${cls['subject']}'),
                  trailing: ElevatedButton(
                    onPressed: () => _assignSubstitute('${cls['period']}', teacher['name']),
                    child: const Text('Assign'),
                  ),
                );
              }).toList(),
            ),
          );
        },
      ),
    );
  }
}
