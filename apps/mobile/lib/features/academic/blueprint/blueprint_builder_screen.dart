import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/api_client.dart';

class BlueprintBuilderScreen extends StatefulWidget {
  const BlueprintBuilderScreen({super.key});

  @override
  State<BlueprintBuilderScreen> createState() => _BlueprintBuilderScreenState();
}

class _BlueprintBuilderScreenState extends State<BlueprintBuilderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiClient = ApiClient();

  String? _selectedSubjectId;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _totalMarksController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();

  // Difficulty Distribution
  final TextEditingController _easyPercentController = TextEditingController(text: '40');
  final TextEditingController _mediumPercentController = TextEditingController(text: '40');
  final TextEditingController _hardPercentController = TextEditingController(text: '20');

  // Dynamic Sections
  final List<Map<String, dynamic>> _sections = [];

  // Mock Subjects (In real app, fetch from API)
  final List<Map<String, String>> _subjects = [
    {'id': 'sub-1', 'name': 'Mathematics'},
    {'id': 'sub-2', 'name': 'Science'},
    {'id': 'sub-3', 'name': 'English'},
  ];

  final List<String> _questionTypes = ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'TRUE_FALSE'];

  void _addSection() {
    setState(() {
      _sections.add({
        'type': 'MCQ',
        'count': 0,
        'marks': 1,
      });
    });
  }

  void _removeSection(int index) {
    setState(() {
      _sections.removeAt(index);
    });
  }

  Future<void> _saveBlueprint() async {
    if (!_formKey.currentState!.validate()) return;

    final blueprintData = {
      'name': _nameController.text,
      'subjectId': _selectedSubjectId,
      'totalMarks': int.tryParse(_totalMarksController.text) ?? 0,
      'durationMinutes': int.tryParse(_durationController.text) ?? 0,
      'structure': _sections.map((s) => {
        'type': s['type'],
        'count': int.tryParse(s['count'].toString()) ?? 0,
        'marks': int.tryParse(s['marks'].toString()) ?? 0,
      }).toList(),
      'difficultyDistribution': {
        'EASY': int.tryParse(_easyPercentController.text) ?? 0,
        'MEDIUM': int.tryParse(_mediumPercentController.text) ?? 0,
        'HARD': int.tryParse(_hardPercentController.text) ?? 0,
      }
    };

    try {
      // Assuming endpoint POST /academic/blueprint exists or will be created
      await _apiClient.dio.post('/academic/blueprint', data: blueprintData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Blueprint Saved Successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving blueprint: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Blueprint')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subject Dropdown
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'Subject'),
                  value: _selectedSubjectId,
                  items: _subjects.map((sub) {
                    return DropdownMenuItem(value: sub['id'], child: Text(sub['name']!));
                  }).toList(),
                  onChanged: (val) => setState(() => _selectedSubjectId = val),
                  validator: (val) => val == null ? 'Please select a subject' : null,
                ),
                const SizedBox(height: 10),

                // Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Blueprint Name'),
                  validator: (val) => val!.isEmpty ? 'Enter name' : null,
                ),
                const SizedBox(height: 10),

                // Total Marks & Duration
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _totalMarksController,
                        decoration: const InputDecoration(labelText: 'Total Marks'),
                        keyboardType: TextInputType.number,
                        validator: (val) => val!.isEmpty ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: _durationController,
                        decoration: const InputDecoration(labelText: 'Duration (mins)'),
                        keyboardType: TextInputType.number,
                        validator: (val) => val!.isEmpty ? 'Required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Difficulty Distribution
                const Text('Difficulty Distribution (%)', style: TextStyle(fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    Expanded(child: TextFormField(controller: _easyPercentController, decoration: const InputDecoration(labelText: 'Easy'))),
                    const SizedBox(width: 5),
                    Expanded(child: TextFormField(controller: _mediumPercentController, decoration: const InputDecoration(labelText: 'Medium'))),
                    const SizedBox(width: 5),
                    Expanded(child: TextFormField(controller: _hardPercentController, decoration: const InputDecoration(labelText: 'Hard'))),
                  ],
                ),
                const SizedBox(height: 20),

                // Sections List
                const Text('Question Structure', style: TextStyle(fontWeight: FontWeight.bold)),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _sections.length,
                  itemBuilder: (context, index) {
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 5),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 2,
                              child: DropdownButtonFormField<String>(
                                value: _sections[index]['type'],
                                items: _questionTypes.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                                onChanged: (val) => setState(() => _sections[index]['type'] = val),
                                decoration: const InputDecoration(labelText: 'Type', contentPadding: EdgeInsets.zero),
                              ),
                            ),
                            const SizedBox(width: 5),
                            Expanded(
                              child: TextFormField(
                                initialValue: _sections[index]['count'].toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Count'),
                                onChanged: (val) => _sections[index]['count'] = val,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Expanded(
                              child: TextFormField(
                                initialValue: _sections[index]['marks'].toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(labelText: 'Marks/Q'),
                                onChanged: (val) => _sections[index]['marks'] = val,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _removeSection(index),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                TextButton.icon(
                  onPressed: _addSection,
                  icon: const Icon(Icons.add),
                  label: const Text('Add Section'),
                ),
                const SizedBox(height: 30),

                // Save Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _saveBlueprint,
                    child: const Text('Save Blueprint'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
