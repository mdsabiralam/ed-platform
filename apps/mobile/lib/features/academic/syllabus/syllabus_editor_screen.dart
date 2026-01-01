import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/api_client.dart';

class SyllabusEditorScreen extends StatefulWidget {
  final String planId;

  const SyllabusEditorScreen({Key? key, required this.planId}) : super(key: key);

  @override
  State<SyllabusEditorScreen> createState() => _SyllabusEditorScreenState();
}

class _SyllabusEditorScreenState extends State<SyllabusEditorScreen> {
  final ApiClient _apiClient = ApiClient();
  bool _isLoading = true;
  String? _error;
  List<dynamic> _chapters = [];

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
          _chapters = (response.data['chapters'] as List<dynamic>? ?? []);
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

  Future<void> _saveOrder() async {
    setState(() => _isLoading = true);
    try {
      final List<Map<String, dynamic>> updates = [];

      // Flatten the structure to get all topics with their new indices
      for (var chapter in _chapters) {
        final topics = chapter['topics'] as List<dynamic>;
        for (int i = 0; i < topics.length; i++) {
          updates.add({
            'topicId': topics[i]['id'],
            'orderIndex': i, // Simplified: assuming strictly local order per chapter or global order logic
          });
        }
      }

      // Backend expects global updates list
      await _apiClient.dio.put(
        '/academic/curriculum/reorder-topics',
        data: updates,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Syllabus order saved successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Syllabus Editor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveOrder,
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: _chapters.length,
        itemBuilder: (context, index) {
          final chapter = _chapters[index];
          final topics = chapter['topics'] as List<dynamic>? ?? [];

          return ExpansionTile(
            key: Key('chapter-${chapter['id']}'),
            title: Text('Chapter ${chapter['chapterNumber']}: ${chapter['name']}'),
            initiallyExpanded: true,
            children: [
              // Implementing ReorderableListView for topics within a chapter
              // Note: ReorderableListView requires a constrained height or to be the primary scroll view.
              // Here we use it inside an ExpansionTile which is tricky.
              // A safer approach for nested lists is simply ReorderableListView with a custom build.
              // But for simplicity in this task, let's assume we want to reorder TOPICS within this specific chapter.
              Container(
                constraints: const BoxConstraints(maxHeight: 300), // Limit height
                child: ReorderableListView(
                  shrinkWrap: true,
                  physics: const ClampingScrollPhysics(),
                  children: [
                    for (int i = 0; i < topics.length; i++)
                      ListTile(
                        key: ValueKey(topics[i]['id']),
                        leading: const Icon(Icons.drag_handle),
                        title: Text(topics[i]['name']),
                      ),
                  ],
                  onReorder: (oldIndex, newIndex) {
                    setState(() {
                      if (oldIndex < newIndex) {
                        newIndex -= 1;
                      }
                      final item = topics.removeAt(oldIndex);
                      topics.insert(newIndex, item);
                    });
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
