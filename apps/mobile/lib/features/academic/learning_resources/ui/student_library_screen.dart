import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/api_client.dart';
import '../data/learning_resource_repository.dart';
import '../models/learning_resource_models.dart';

class StudentLibraryScreen extends StatefulWidget {
  final String topicId; // Passed from syllabus or context
  final String topicName;

  const StudentLibraryScreen({
    Key? key,
    required this.topicId,
    required this.topicName,
  }) : super(key: key);

  @override
  State<StudentLibraryScreen> createState() => _StudentLibraryScreenState();
}

class _StudentLibraryScreenState extends State<StudentLibraryScreen> {
  late final LearningResourceRepository _repository;
  List<LearningResource> _resources = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _repository = LearningResourceRepository(ApiClient());
    _loadResources();
  }

  Future<void> _loadResources() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final resources = await _repository.getStudentResources(widget.topicId);
      setState(() {
        _resources = resources;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _launchUrl(LearningResource resource) async {
    // Track view
    _repository.trackView(resource.id);

    final Uri url = Uri.parse(resource.url);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch URL')),
        );
      }
    }
  }

  IconData _getIcon(ResourceType type) {
    switch (type) {
      case ResourceType.PDF:
        return Icons.picture_as_pdf;
      case ResourceType.VIDEO:
        return Icons.play_circle_fill;
      case ResourceType.AUDIO:
        return Icons.audiotrack;
      case ResourceType.WEB_LINK:
      default:
        return Icons.link;
    }
  }

  Color _getIconColor(ResourceType type) {
    switch (type) {
      case ResourceType.PDF:
        return Colors.red;
      case ResourceType.VIDEO:
        return Colors.blue; // Or Red for YouTube
      case ResourceType.AUDIO:
        return Colors.orange;
      case ResourceType.WEB_LINK:
      default:
        return Colors.blueGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.topicName)),
      body: RefreshIndicator(
        onRefresh: _loadResources,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text('Error: $_error'))
                : _resources.isEmpty
                    ? const Center(child: Text('No resources found.'))
                    : ListView.builder(
                        itemCount: _resources.length,
                        itemBuilder: (context, index) {
                          final resource = _resources[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            child: ListTile(
                              leading: Icon(
                                _getIcon(resource.type),
                                color: _getIconColor(resource.type),
                                size: 36,
                              ),
                              title: Text(resource.title),
                              subtitle: resource.description != null
                                  ? Text(resource.description!,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis)
                                  : null,
                              trailing:
                                  const Icon(Icons.arrow_forward_ios, size: 16),
                              onTap: () => _launchUrl(resource),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
