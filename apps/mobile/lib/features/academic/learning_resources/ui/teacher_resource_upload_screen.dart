import 'package:flutter/material.dart';
import '../../../../core/api_client.dart';
import '../data/learning_resource_repository.dart';
import '../models/learning_resource_models.dart';

class TeacherResourceUploadScreen extends StatefulWidget {
  const TeacherResourceUploadScreen({Key? key}) : super(key: key);

  @override
  State<TeacherResourceUploadScreen> createState() =>
      _TeacherResourceUploadScreenState();
}

class _TeacherResourceUploadScreenState
    extends State<TeacherResourceUploadScreen> {
  final LearningResourceRepository _repository =
      LearningResourceRepository(ApiClient());

  List<AcademicClass> _classes = [];
  List<Subject> _subjects = [];
  List<Chapter> _chapters = [];
  List<Topic> _topics = [];

  AcademicClass? _selectedClass;
  Subject? _selectedSubject;
  Chapter? _selectedChapter;
  Topic? _selectedTopic;
  ResourceType _selectedType = ResourceType.VIDEO;

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _urlController = TextEditingController();

  // In a real app, use FilePicker result
  String? _selectedFilePath;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  Future<void> _loadClasses() async {
    final classes = await _repository.getClasses();
    setState(() {
      _classes = classes;
    });
  }

  Future<void> _loadSubjects(String classId) async {
    final subjects = await _repository.getSubjects(classId);
    setState(() {
      _subjects = subjects;
      _selectedSubject = null;
      _chapters = [];
      _selectedChapter = null;
      _topics = [];
      _selectedTopic = null;
    });
  }

  Future<void> _loadChapters(String subjectId) async {
    final chapters = await _repository.getChapters(subjectId);
    setState(() {
      _chapters = chapters;
      _selectedChapter = null;
      _topics = [];
      _selectedTopic = null;
    });
  }

  Future<void> _loadTopics(String chapterId) async {
    final topics = await _repository.getTopics(chapterId);
    setState(() {
      _topics = topics;
      _selectedTopic = null;
    });
  }

  Future<void> _pickFile() async {
    // Simulate file picking
    // FilePickerResult? result = await FilePicker.platform.pickFiles();
    setState(() {
      _selectedFilePath = '/path/to/simulated/file.pdf';
    });
  }

  Future<void> _submit() async {
    if (_titleController.text.isEmpty ||
        _selectedTopic == null ||
        _selectedChapter == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await _repository.uploadResource(
        title: _titleController.text,
        type: _selectedType,
        topicId: _selectedTopic!.id,
        chapterId: _selectedChapter!.id,
        url: _selectedType == ResourceType.WEB_LINK ||
                _selectedType == ResourceType.VIDEO
            ? _urlController.text
            : null,
        filePath: _selectedType == ResourceType.PDF ||
                _selectedType == ResourceType.AUDIO
            ? _selectedFilePath
            : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Resource uploaded successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload Resource')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownButtonFormField<AcademicClass>(
              value: _selectedClass,
              decoration: const InputDecoration(labelText: 'Class'),
              items: _classes.map((c) {
                return DropdownMenuItem(value: c, child: Text(c.name));
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedClass = val);
                  _loadSubjects(val.id);
                }
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<Subject>(
              value: _selectedSubject,
              decoration: const InputDecoration(labelText: 'Subject'),
              items: _subjects.map((s) {
                return DropdownMenuItem(value: s, child: Text(s.name));
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedSubject = val);
                  _loadChapters(val.id);
                }
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<Chapter>(
              value: _selectedChapter,
              decoration: const InputDecoration(labelText: 'Chapter'),
              items: _chapters.map((c) {
                return DropdownMenuItem(value: c, child: Text(c.name));
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _selectedChapter = val);
                  _loadTopics(val.id);
                }
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<Topic>(
              value: _selectedTopic,
              decoration: const InputDecoration(labelText: 'Topic'),
              items: _topics.map((t) {
                return DropdownMenuItem(value: t, child: Text(t.name));
              }).toList(),
              onChanged: (val) {
                setState(() => _selectedTopic = val);
              },
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Resource Title'),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<ResourceType>(
              value: _selectedType,
              decoration: const InputDecoration(labelText: 'Resource Type'),
              items: ResourceType.values.map((t) {
                return DropdownMenuItem(
                    value: t, child: Text(t.toString().split('.').last));
              }).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedType = val);
              },
            ),
            const SizedBox(height: 16),
            if (_selectedType == ResourceType.WEB_LINK ||
                _selectedType == ResourceType.VIDEO)
              TextField(
                controller: _urlController,
                decoration: const InputDecoration(labelText: 'URL (YouTube/Web)'),
              )
            else
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _selectedFilePath ?? 'No file selected',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _pickFile,
                    child: const Text('Pick File'),
                  ),
                ],
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Upload'),
            ),
          ],
        ),
      ),
    );
  }
}
