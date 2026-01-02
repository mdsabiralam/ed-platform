import 'package:flutter/material.dart';

// Enums (replicating backend enums)
enum QuestionType {
  MCQ,
  TRUE_FALSE,
  SHORT_ANSWER,
  LONG_ANSWER,
}

enum DifficultyLevel {
  EASY,
  MEDIUM,
  HARD,
}

enum BloomsLevel {
  REMEMBER,
  UNDERSTAND,
  APPLY,
  ANALYZE,
  EVALUATE,
  CREATE,
}

class QuestionAuthoringScreen extends StatefulWidget {
  const QuestionAuthoringScreen({super.key});

  @override
  State<QuestionAuthoringScreen> createState() => _QuestionAuthoringScreenState();
}

class _QuestionAuthoringScreenState extends State<QuestionAuthoringScreen> {
  final _formKey = GlobalKey<FormState>();

  // Form State
  String? _selectedSubjectId; // Placeholder for subject ID
  QuestionType _selectedType = QuestionType.MCQ;
  DifficultyLevel _selectedDifficulty = DifficultyLevel.EASY;
  BloomsLevel _selectedBlooms = BloomsLevel.REMEMBER;
  final TextEditingController _marksController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();

  // Placeholder data for Subjects
  final List<Map<String, String>> _subjects = [
    {'id': 'sub-1', 'name': 'Mathematics'},
    {'id': 'sub-2', 'name': 'Science'},
  ];

  @override
  void dispose() {
    _marksController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      // Logic to submit data to backend API would go here
      // For now, just print the values
      print('Subject: $_selectedSubjectId');
      print('Type: $_selectedType');
      print('Difficulty: $_selectedDifficulty');
      print('Marks: ${_marksController.text}');
      print('Content: ${_contentController.text}');
      print('Blooms: $_selectedBlooms');

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Processing Data')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Question'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              // Subject Dropdown
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Subject'),
                value: _selectedSubjectId,
                items: _subjects.map((subject) {
                  return DropdownMenuItem(
                    value: subject['id'],
                    child: Text(subject['name']!),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedSubjectId = value;
                  });
                },
                validator: (value) => value == null ? 'Please select a subject' : null,
              ),
              const SizedBox(height: 16),

              // Question Type Dropdown
              DropdownButtonFormField<QuestionType>(
                decoration: const InputDecoration(labelText: 'Question Type'),
                value: _selectedType,
                items: QuestionType.values.map((type) {
                  return DropdownMenuItem(
                    value: type,
                    child: Text(type.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    if (value != null) _selectedType = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Difficulty Dropdown
              DropdownButtonFormField<DifficultyLevel>(
                decoration: const InputDecoration(labelText: 'Difficulty Level'),
                value: _selectedDifficulty,
                items: DifficultyLevel.values.map((level) {
                  return DropdownMenuItem(
                    value: level,
                    child: Text(level.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    if (value != null) _selectedDifficulty = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Bloom's Taxonomy Dropdown
              DropdownButtonFormField<BloomsLevel>(
                decoration: const InputDecoration(labelText: "Bloom's Level"),
                value: _selectedBlooms,
                items: BloomsLevel.values.map((level) {
                  return DropdownMenuItem(
                    value: level,
                    child: Text(level.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    if (value != null) _selectedBlooms = value;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Marks Text Field
              TextFormField(
                controller: _marksController,
                decoration: const InputDecoration(labelText: 'Marks'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter marks';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Please enter a valid number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Content Text Field (Supports Rich Text conceptual placeholder)
              TextFormField(
                controller: _contentController,
                decoration: const InputDecoration(
                  labelText: 'Question Content (HTML/LaTeX supported)',
                  alignLabelWithHint: true,
                ),
                maxLines: 5,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter content';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Submit Button
              ElevatedButton(
                onPressed: _submitForm,
                child: const Text('Create Question'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
