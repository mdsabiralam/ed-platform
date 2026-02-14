import 'package:flutter/material.dart';
import 'package:mobile/core/api/api_client.dart';

class ActiveClassesScreen extends StatefulWidget {
  final ApiClient apiClient;

  const ActiveClassesScreen({super.key, required this.apiClient});

  @override
  State<ActiveClassesScreen> createState() => _ActiveClassesScreenState();
}

class _ActiveClassesScreenState extends State<ActiveClassesScreen> {
  List<dynamic> _activeClasses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchActiveClasses();
  }

  Future<void> _fetchActiveClasses() async {
    try {
      final response = await widget.apiClient.get('/academic/live/active');
      setState(() {
        _activeClasses = response.data as List<dynamic>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      // Handle error
    }
  }

  Future<void> _auditClass(String routineId) async {
    try {
      // Mocking Principal Role
      // In real app, headers are set in ApiClient or Interceptor
      // Here we assume the endpoint handles checking or we send it (but ApiClient doesn't support headers arg yet easily)
      // So we just simulate the call.
      final response = await widget.apiClient.get('/academic/live/$routineId/join');
      final link = response.data['meetingLink'];

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Auditing Class: $link')),
        );
        // Launch URL
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to join: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Active Classes (Principal)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _activeClasses.isEmpty
              ? const Center(child: Text('No active classes found.'))
              : ListView.builder(
                  itemCount: _activeClasses.length,
                  itemBuilder: (context, index) {
                    final cls = _activeClasses[index];
                    final subject = cls['subject']?['name'] ?? 'Subject';
                    final teacher = cls['teacher']?['firstName'] ?? 'Teacher';
                    final className = cls['class']?['name'] ?? 'Class';

                    return Card(
                      child: ListTile(
                        title: Text('$className - $subject'),
                        subtitle: Text('Teacher: $teacher'),
                        trailing: ElevatedButton(
                          onPressed: () => _auditClass(cls['id']),
                          child: const Text('Audit'),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
