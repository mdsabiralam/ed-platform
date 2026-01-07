import 'package:flutter/material.dart';
import 'package:mobile/shared/ui/widgets/voice_enabled_text_field.dart';

class ClassDiaryForm extends StatefulWidget {
  final String classId;
  final String subjectId;

  const ClassDiaryForm({
    Key? key,
    required this.classId,
    required this.subjectId,
  }) : super(key: key);

  @override
  State<ClassDiaryForm> createState() => _ClassDiaryFormState();
}

class _ClassDiaryFormState extends State<ClassDiaryForm> {
  final _formKey = GlobalKey<FormState>();
  final _topicsController = TextEditingController();
  final _homeworkController = TextEditingController();
  final _notesController = TextEditingController();

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // API call to save diary entry
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Diary Updated!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Class Diary')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Log your daily teaching summary',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              SizedBox(height: 24),
              VoiceEnabledTextField(
                controller: _topicsController,
                labelText: 'Topics Covered',
                maxLines: 4,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _homeworkController,
                decoration: InputDecoration(
                  labelText: 'Homework Assigned',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  labelText: 'Remarks / Notes',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submit,
                child: Text('Save Entry'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
