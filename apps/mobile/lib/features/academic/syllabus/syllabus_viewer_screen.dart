import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/api_client.dart'; // Adjust path as needed

class SyllabusViewerScreen extends StatefulWidget {
  final String planId;

  const SyllabusViewerScreen({Key? key, required this.planId}) : super(key: key);

  @override
  State<SyllabusViewerScreen> createState() => _SyllabusViewerScreenState();
}

class _SyllabusViewerScreenState extends State<SyllabusViewerScreen> {
  Map<String, dynamic>? _curriculumData;
  bool _isLoading = true;
  String? _error;
  final ApiClient _apiClient = ApiClient();

  @override
  void initState() {
    super.initState();
    _fetchCurriculum();
  }

  Future<void> _fetchCurriculum() async {
    try {
      final response = await _apiClient.dio.get('/academic/curriculum/${widget.planId}');

      if (response.statusCode == 200) {
        setState(() {
          _curriculumData = response.data;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load syllabus');
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null) {
      return Scaffold(body: Center(child: Text('Error: $_error')));
    }

    final chapters = _curriculumData?['chapters'] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Syllabus Viewer (Read-Only)'),
      ),
      body: ListView.builder(
        itemCount: chapters.length,
        itemBuilder: (context, index) {
          final chapter = chapters[index];
          final topics = chapter['topics'] as List<dynamic>? ?? [];

          return ExpansionTile(
            title: Text('Chapter ${chapter['chapterNumber']}: ${chapter['name']}'),
            subtitle: chapter['targetCompletionDate'] != null
                ? Text('Target: ${chapter['targetCompletionDate']}')
                : null,
            children: topics.map<Widget>((topic) {
              return ListTile(
                title: Text(topic['name']),
                subtitle: Text('Hours: ${topic['estimatedHours']}'),
                // 7.A.07 Display Learning Outcomes if available (not in current API response, needed update if required here)
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
