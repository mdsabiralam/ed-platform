import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../exam/data/exam_repository.dart';
import '../exam/widgets/exam_countdown_widget.dart';

class StudentDashboardScreen extends StatelessWidget {
  final String classId; // In a real app, this would come from User/Auth State
  final ApiClient apiClient;

  const StudentDashboardScreen({
    Key? key,
    required this.classId,
    required this.apiClient,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Repository should ideally be provided via dependency injection (RepositoryProvider)
    final examRepository = ExamRepository(apiClient: apiClient);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Dashboard'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome Back!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            // Exam Countdown Widget
            ExamCountdownWidget(
              classId: classId,
              examRepository: examRepository,
            ),
            const SizedBox(height: 20),
            // Placeholders for other dashboard items
            Card(
              child: ListTile(
                leading: const Icon(Icons.class_),
                title: const Text('Today\'s Classes'),
                subtitle: const Text('Check your routine'),
                onTap: () {},
              ),
            ),
             Card(
              child: ListTile(
                leading: const Icon(Icons.assignment),
                title: const Text('Homework'),
                subtitle: const Text('3 Pending Assignments'),
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }
}
