import 'dart:io';
import 'package:flutter/material.dart';
import 'package:html_editor_enhanced/html_editor.dart';
import 'package:flutter_tex/flutter_tex.dart';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

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
  final TextEditingController _optionsController = TextEditingController();
  final TextEditingController _correctAnswerController = TextEditingController();
  final TextEditingController _topicController = TextEditingController();
  final HtmlEditorController _htmlController = HtmlEditorController();
  String _previewContent = '';
  File? _selectedImage;
  String? _imageUrl;

  // Placeholder data for Subjects
  final List<Map<String, String>> _subjects = [
    {'id': 'sub-1', 'name': 'Mathematics'},
    {'id': 'sub-2', 'name': 'Science'},
  ];

  @override
  void dispose() {
    _marksController.dispose();
    _optionsController.dispose();
    _correctAnswerController.dispose();
    _topicController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  Future<void> _uploadImage() async {
    if (_selectedImage == null) return;

    try {
      final dio = Dio();
      // Replace with your actual backend URL
      const url = 'http://10.0.2.2:3000/api/academic/question-bank/upload-image';

      String fileName = _selectedImage!.path.split('/').last;
      FormData formData = FormData.fromMap({
        "image": await MultipartFile.fromFile(_selectedImage!.path, filename: fileName),
      });

      final response = await dio.post(url, data: formData);
      if (response.statusCode == 201 || response.statusCode == 200) {
        setState(() {
          _imageUrl = response.data['imageUrl'];
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image Uploaded Successfully!')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload Failed: $e')),
      );
    }
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

      try {
        final dio = Dio();
        const url = 'http://10.0.2.2:3000/api/academic/question-bank';

        Map<String, dynamic> data = {
          'subjectId': _selectedSubjectId,
          'topicTag': _topicController.text,
          'type': _selectedType.name,
          'difficulty': _selectedDifficulty.name,
          'marks': int.parse(_marksController.text),
          'content': content,
          'bloomsLevel': _selectedBlooms.name,
          'correctAnswer': _correctAnswerController.text,
          'imageUrl': _imageUrl,
        };

        if (_selectedType == QuestionType.MCQ) {
          try {
            data['options'] = jsonDecode(_optionsController.text);
          } catch (e) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Invalid JSON in Options')),
            );
            return;
          }
        }

        final response = await dio.post(url, data: data);

        if (response.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Question Created Successfully!')),
          );
          // Optional: Clear form or navigate back
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Creation Failed: $e')),
        );
      }
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

              // Topic Tag
              TextFormField(
                controller: _topicController,
                decoration: const InputDecoration(labelText: 'Topic Tag'),
                validator: (value) => value == null || value.isEmpty ? 'Please enter a topic' : null,
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

              // Correct Answer
              TextFormField(
                controller: _correctAnswerController,
                decoration: const InputDecoration(labelText: 'Correct Answer'),
                validator: (value) => value == null || value.isEmpty ? 'Please enter correct answer' : null,
              ),
              const SizedBox(height: 16),

              // Options (MCQ only)
              if (_selectedType == QuestionType.MCQ) ...[
                TextFormField(
                  controller: _optionsController,
                  decoration: const InputDecoration(
                    labelText: 'Options (JSON format)',
                    hintText: '{"a": "Option A", "b": "Option B"}',
                  ),
                  maxLines: 3,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter options for MCQ';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
              ],

              // Image Upload Section
              const Text('Question Image', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: _pickImage,
                    icon: const Icon(Icons.image),
                    label: const Text('Pick Image'),
                  ),
                  const SizedBox(width: 16),
                  if (_selectedImage != null) ...[
                    ElevatedButton.icon(
                      onPressed: _uploadImage,
                      icon: const Icon(Icons.cloud_upload),
                      label: const Text('Upload'),
                    ),
                  ],
                ],
              ),
              if (_selectedImage != null) ...[
                const SizedBox(height: 8),
                SizedBox(
                  height: 150,
                  child: Image.file(_selectedImage!),
                ),
              ],
              if (_imageUrl != null) ...[
                const SizedBox(height: 8),
                Text('Uploaded URL: $_imageUrl', style: const TextStyle(color: Colors.green)),
              ],
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
