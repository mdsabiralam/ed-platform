import 'package:flutter/material.dart';
import 'package:mobile/features/academic/assignments/models/assignment.dart';
// import 'package:file_picker/file_picker.dart'; // Mocking this since I can't install packages

class MyDiaryScreen extends StatefulWidget {
  const MyDiaryScreen({super.key});

  @override
  State<MyDiaryScreen> createState() => _MyDiaryScreenState();
}

class _MyDiaryScreenState extends State<MyDiaryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Diary 📚'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          AssignmentList(status: 'PENDING'),
          AssignmentList(status: 'COMPLETED'),
        ],
      ),
    );
  }
}

class AssignmentList extends StatelessWidget {
  final String status;
  const AssignmentList({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final assignments = status == 'PENDING' ? [
        Assignment(
            id: '1',
            title: 'Algebra 101',
            subjectName: 'Math',
            dueDate: DateTime.now().add(const Duration(hours: 2))
        ),
        Assignment(
            id: '2',
            title: 'World War II',
            subjectName: 'History',
            dueDate: DateTime.now().add(const Duration(days: 2))
        ),
    ] : [];

    if (assignments.isEmpty) {
        return const Center(child: Text('No homework today! 🎉', style: TextStyle(fontSize: 18)));
    }

    return ListView.builder(
      itemCount: assignments.length,
      itemBuilder: (context, index) {
        return AssignmentCard(assignment: assignments[index]);
      },
    );
  }
}

class AssignmentCard extends StatelessWidget {
  final Assignment assignment;
  const AssignmentCard({super.key, required this.assignment});

  @override
  Widget build(BuildContext context) {
    final timeLeft = assignment.dueDate.difference(DateTime.now());
    final isLate = timeLeft.isNegative;
    final isUrgent = !isLate && timeLeft.inHours < 24;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                     Text(assignment.subjectName, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                     if (isLate)
                        Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.red[100], borderRadius: BorderRadius.circular(4)),
                            child: const Text('LATE SUBMISSION', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                        )
                 ],
             ),
             const SizedBox(height: 8),
             Text(assignment.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
             const SizedBox(height: 8),
             Text(
                 'Due: ${assignment.dueDate.toString()}',
                 style: TextStyle(
                     color: isUrgent ? Colors.red : Colors.black87,
                     fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal
                 ),
             ),
             const SizedBox(height: 16),
             SizedBox(
                 width: double.infinity,
                 child: ElevatedButton(
                     onPressed: () {
                         showModalBottomSheet(context: context, builder: (_) => SubmitAssignmentWidget(assignmentId: assignment.id));
                     },
                     child: const Text('Submit'),
                 ),
             )
          ],
        ),
      ),
    );
  }
}

class SubmitAssignmentWidget extends StatefulWidget {
    final String assignmentId;
    const SubmitAssignmentWidget({super.key, required this.assignmentId});

    @override
    State<SubmitAssignmentWidget> createState() => _SubmitAssignmentWidgetState();
}

class _SubmitAssignmentWidgetState extends State<SubmitAssignmentWidget> {
    bool _uploading = false;
    String? _fileName;

    Future<void> _pickFile() async {
        // Mock File Picker Logic
        // FilePickerResult? result = await FilePicker.platform.pickFiles();
        setState(() => _uploading = true);
        await Future.delayed(const Duration(seconds: 2)); // Simulating upload
        setState(() {
            _uploading = false;
            _fileName = "homework.pdf";
        });
    }

    @override
    Widget build(BuildContext context) {
        return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                    const Text('Upload Homework', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    if (_fileName != null) ...[
                        Icon(Icons.check_circle, color: Colors.green, size: 40),
                        Text('Uploaded: $_fileName'),
                    ] else
                        _uploading
                           ? const CircularProgressIndicator()
                           : OutlinedButton.icon(
                               onPressed: _pickFile,
                               icon: const Icon(Icons.upload_file),
                               label: const Text('Select File (PDF/Image)'),
                           ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                        onPressed: _fileName == null ? null : () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Submitted successfully!')));
                        },
                        child: const Text('Confirm Submission'),
                    )
                ],
            ),
        );
    }
}
