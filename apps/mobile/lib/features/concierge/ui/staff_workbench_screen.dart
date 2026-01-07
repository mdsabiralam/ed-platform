import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/features/concierge/data/concierge_repository.dart';
import 'package:mobile/features/concierge/models/concierge_request.dart';
import 'package:mobile/features/concierge/services/ai_service.dart';

class StaffWorkbenchScreen extends StatefulWidget {
  final String requestId;

  const StaffWorkbenchScreen({
    super.key,
    required this.requestId,
  });

  @override
  State<StaffWorkbenchScreen> createState() => _StaffWorkbenchScreenState();
}

class _StaffWorkbenchScreenState extends State<StaffWorkbenchScreen> {
  late final ConciergeRepository _repository;
  late final AiService _aiService;

  ConciergeRequest? _request;
  bool _isLoading = true;
  bool _isGeneratingAi = false;
  String? _errorMessage;

  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _dueDateController = TextEditingController();

  final List<TextEditingController> _questionControllers = [];

  @override
  void initState() {
    super.initState();
    _repository = ConciergeRepository(ApiClient());
    _aiService = AiService();
    _loadRequest();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _dueDateController.dispose();
    for (var controller in _questionControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadRequest() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      final request = await _repository.getRequestById(widget.requestId);
      if (!mounted) return;

      if (request != null) {
        setState(() {
          _request = request;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Request not found';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Failed to load request';
        _isLoading = false;
      });
    }
  }

  Future<void> _generateAiContent() async {
    if (_request == null) return;

    setState(() {
      _isGeneratingAi = true;
    });

    try {
      final content = await _aiService.generateContent(_request!.instructions);
      if (!mounted) return;

      setState(() {
        _titleController.text = content['title'] ?? '';
        _descriptionController.text = content['description'] ?? '';

        // Clear existing questions and controllers
        for (var controller in _questionControllers) {
          controller.dispose();
        }
        _questionControllers.clear();

        // Add new questions
        final questions = List<String>.from(content['questions'] ?? []);
        for (var q in questions) {
          _questionControllers.add(TextEditingController(text: q));
        }

        _isGeneratingAi = false;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to generate content')),
      );
      setState(() {
        _isGeneratingAi = false;
      });
    }
  }

  Future<void> _publish() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final questions = _questionControllers.map((c) => c.text).toList();
      await _repository.publishAssignment(widget.requestId, {
        'title': _titleController.text,
        'description': _descriptionController.text,
        'dueDate': _dueDateController.text,
        'questions': questions,
      });
      if (!mounted) return;
      context.pop(); // Go back to queue
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to publish assignment')),
      );
    }
  }

  Future<void> _reject() async {
    try {
      await _repository.rejectRequest(widget.requestId);
      if (!mounted) return;
      context.pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to reject request')),
      );
    }
  }

  void _addQuestion() {
    setState(() {
      _questionControllers.add(TextEditingController());
    });
  }

  void _removeQuestion(int index) {
    setState(() {
      final controller = _questionControllers.removeAt(index);
      controller.dispose();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null || _request == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(child: Text(_errorMessage ?? 'Request not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Workbench: ${_request!.teacherName}'),
      ),
      body: Row(
        children: [
          // Left Panel: Source Material
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.grey[200],
              child: _request!.rawImageUrl != null
                  ? InteractiveViewer(
                      child: Image.network(
                        _request!.rawImageUrl!,
                        fit: BoxFit.contain,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(
                            child: Icon(Icons.broken_image, size: 64, color: Colors.grey),
                          );
                        },
                      ),
                    )
                  : const Center(
                      child: Text('No image provided'),
                    ),
            ),
          ),

          // Right Panel: Work Area
          Expanded(
            flex: 1,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Assignment Details',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        ElevatedButton.icon(
                          onPressed: _isGeneratingAi ? null : _generateAiContent,
                          icon: _isGeneratingAi
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.auto_awesome),
                          label: const Text('Auto-Generate Content'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Title',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) =>
                          value?.isEmpty ?? true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _dueDateController,
                      decoration: const InputDecoration(
                        labelText: 'Due Date',
                        border: OutlineInputBorder(),
                        suffixIcon: Icon(Icons.calendar_today),
                      ),
                      onTap: () async {
                        final date = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now().add(const Duration(days: 7)),
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (date != null) {
                          _dueDateController.text = date.toString().split(' ')[0];
                        }
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Questions',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        IconButton(
                          onPressed: _addQuestion,
                          icon: const Icon(Icons.add_circle_outline),
                        ),
                      ],
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _questionControllers.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    controller: _questionControllers[index],
                                    decoration: InputDecoration(
                                      labelText: 'Question ${index + 1}',
                                      border: const OutlineInputBorder(),
                                    ),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  onPressed: () => _removeQuestion(index),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            onPressed: _reject,
                            child: const Text('Reject Request'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            onPressed: _publish,
                            child: const Text('Publish & Notify'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
