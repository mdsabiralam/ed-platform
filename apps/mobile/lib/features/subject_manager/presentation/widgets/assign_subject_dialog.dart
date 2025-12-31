import 'package:mobile/features/subject_manager/presentation/bloc/subject_bloc.dart';
import 'package:mobile/features/subject_manager/presentation/bloc/subject_event.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AssignSubjectDialog extends StatefulWidget {
  const AssignSubjectDialog({super.key});

  @override
  State<AssignSubjectDialog> createState() => _AssignSubjectDialogState();
}

class _AssignSubjectDialogState extends State<AssignSubjectDialog> {
  String? _selectedClass;
  String? _selectedSubject;

  // In a real app, these would come from a data source
  final List<String> _classes = ['Grade 1', 'Grade 2', 'Grade 3'];
  final List<String> _subjects = [
    'Math',
    'Science',
    'English',
    'History',
    'Physics',
  ];

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Assign Subject'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<String>(
            initialValue: _selectedClass,
            hint: const Text('Select Class'),
            items: _classes.map((String value) {
              return DropdownMenuItem<String>(value: value, child: Text(value));
            }).toList(),
            onChanged: (newValue) {
              setState(() {
                _selectedClass = newValue;
              });
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _selectedSubject,
            hint: const Text('Select Subject'),
            items: _subjects.map((String value) {
              return DropdownMenuItem<String>(value: value, child: Text(value));
            }).toList(),
            onChanged: (newValue) {
              setState(() {
                _selectedSubject = newValue;
              });
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            if (_selectedClass != null && _selectedSubject != null) {
              // A mapping from display name to ID
              final classId = _selectedClass == 'Grade 1' ? '1' : '2';
              final subjectId = _selectedSubject == 'Physics' ? 'phy' : 'math';

              context.read<SubjectBloc>().add(
                AssignSubject(classId: classId, subjectId: subjectId),
              );
              Navigator.of(context).pop();
            }
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
