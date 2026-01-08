import 'package:flutter/material.dart';

class StaffWorkbenchScreen extends StatefulWidget {
  final String requestId;
  final String rawImageUrl;

  const StaffWorkbenchScreen({
    super.key,
    required this.requestId,
    required this.rawImageUrl,
  });

  @override
  State<StaffWorkbenchScreen> createState() => _StaffWorkbenchScreenState();
}

class _StaffWorkbenchScreenState extends State<StaffWorkbenchScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _dateController = TextEditingController();

  List<String> _questions = [];
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Staff Workbench')),
      body: Row(
        children: [
          // Left Panel: Source Material
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.black,
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Center(
                  child: Image.network(
                    widget.rawImageUrl,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const CircularProgressIndicator(color: Colors.white);
                    },
                    errorBuilder: (context, error, stackTrace) =>
                      const Text('Failed to load image', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ),
            ),
          ),

          // Right Panel: Work Area
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(24.0),
              color: Colors.white,
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('Assignment Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descController,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _dateController,
                      decoration: const InputDecoration(labelText: 'Due Date', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),

                    // Questions List
                    const Text('Questions', style: TextStyle(fontWeight: FontWeight.bold)),
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300)),
                        child: ListView.builder(
                          itemCount: _questions.length,
                          itemBuilder: (context, index) => ListTile(
                            leading: CircleAvatar(child: Text('${index + 1}')),
                            title: Text(_questions[index]),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete),
                              onPressed: () {
                                setState(() {
                                  _questions.removeAt(index);
                                });
                              },
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // AI Auto-Generate
                    ElevatedButton.icon(
                      icon: const Icon(Icons.auto_awesome),
                      label: Text(_isGenerating ? 'Generating...' : '✨ Auto-Generate Content'),
                      onPressed: _isGenerating ? null : _generateContent,
                    ),

                    const SizedBox(height: 24),
                    const Divider(),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                            onPressed: () {
                              // Reject logic
                              Navigator.pop(context);
                            },
                            child: const Text('Reject Request'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                            onPressed: () {
                              // Publish logic
                              _publishAssignment();
                            },
                            child: const Text('Publish & Notify'),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _generateContent() async {
    setState(() {
      _isGenerating = true;
    });

    // Mock AI Call
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _titleController.text = 'Chapter 5 Summary & Quiz';
      _descController.text = 'Read page 42-45 and answer the following questions.';
      _dateController.text = DateTime.now().add(const Duration(days: 7)).toString().split(' ')[0];
      _questions = [
        'What is the main theme of the chapter?',
        'Define photosynthesis.',
        'List three types of rocks.',
        'Who was the main character?',
        'Explain the water cycle.'
      ];
      _isGenerating = false;
    });
  }

  void _publishAssignment() {
    // Mock Publish Logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Assignment Published!')),
    );
    Navigator.pop(context);
  }
}
