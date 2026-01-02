import 'package:flutter/material.dart';
import 'package:html_editor_enhanced/html_editor.dart';
import 'package:flutter_tex/flutter_tex.dart';

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
  final HtmlEditorController _htmlController = HtmlEditorController();
  String _previewContent = '';

  // Placeholder data for Subjects
  final List<Map<String, String>> _subjects = [
    {'id': 'sub-1', 'name': 'Mathematics'},
    {'id': 'sub-2', 'name': 'Science'},
  ];

  @override
  void dispose() {
    _marksController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    final content = await _htmlController.getText();
    if (_formKey.currentState!.validate()) {
      if (content.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter content')),
        );
        return;
      }

      // Logic to submit data to backend API would go here
      // For now, just print the values
      print('Subject: $_selectedSubjectId');
      print('Type: $_selectedType');
      print('Difficulty: $_selectedDifficulty');
      print('Marks: ${_marksController.text}');
      print('Content: $content');
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

              // Rich Text Editor
              const Text('Question Content (HTML/LaTeX supported)', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: HtmlEditor(
                  controller: _htmlController,
                  htmlEditorOptions: const HtmlEditorOptions(
                    hint: "Type your question here...",
                  ),
                  otherOptions: const OtherOptions(
                    height: 300,
                  ),
                  callbacks: Callbacks(
                    onChangeContent: (String? changed) {
                      setState(() {
                        _previewContent = changed ?? '';
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Live Preview
              const Text('Live Preview', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: TeXView(
                  child: TeXViewDocument(_previewContent),
                  style: const TeXViewStyle(
                    contentColor: Colors.black,
                    backgroundColor: Colors.transparent,
                  ),
                ),
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
