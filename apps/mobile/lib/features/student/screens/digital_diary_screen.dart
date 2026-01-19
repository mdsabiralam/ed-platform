import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class DigitalDiaryScreen extends StatefulWidget {
  const DigitalDiaryScreen({super.key});

  @override
  State<DigitalDiaryScreen> createState() => _DigitalDiaryScreenState();
}

class _DigitalDiaryScreenState extends State<DigitalDiaryScreen> {
  // Mock Data
  final List<Map<String, dynamic>> _assignments = List.generate(5, (index) => {
    'id': index,
    'title': 'Math Chapter ${index + 1}',
    'dueDate': DateTime.now().add(Duration(days: index - 1)), // Some overdue
    'status': index == 0 ? 'Submitted' : 'Pending',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital Diary'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _assignments.length,
      itemBuilder: (context, index) {
        return _buildAssignmentCard(_assignments[index]);
      },
    );
  }

  Widget _buildWebLayout() {
    return Row(
      children: [
        SizedBox(
          width: 350,
          child: ListView.builder(
            itemCount: _assignments.length,
            itemBuilder: (context, index) {
              return _buildAssignmentCard(_assignments[index]);
            },
          ),
        ),
        const VerticalDivider(width: 1),
        const Expanded(child: Center(child: Text('Select an assignment to upload'))),
      ],
    );
  }

  Widget _buildAssignmentCard(Map<String, dynamic> assignment) {
    final bool isLate = DateTime.now().isAfter(assignment['dueDate']) && assignment['status'] == 'Pending';

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        title: Text(assignment['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Row(
          children: [
            Text('Due: ${assignment['dueDate'].toString().split(' ')[0]}'),
            const SizedBox(width: 8),
            if (isLate)
              Container(padding: const EdgeInsets.symmetric(horizontal: 4), decoration: BoxDecoration(color: Colors.red.shade100), child: const Text('Late', style: TextStyle(color: Colors.red, fontSize: 10))),
          ],
        ),
        trailing: Chip(
          label: Text(assignment['status']),
          backgroundColor: assignment['status'] == 'Submitted' ? Colors.green.shade100 : Colors.amber.shade100,
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Description: Complete exercise 5.1 and submit PDF.'),
                const SizedBox(height: 16),
                if (assignment['status'] == 'Pending')
                  ElevatedButton.icon(
                    onPressed: () => _uploadFile(assignment),
                    icon: const Icon(Icons.upload_file),
                    label: const Text('Upload File'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, foregroundColor: Colors.white),
                  )
                else
                  const Text('File Submitted: math_hw.pdf', style: TextStyle(color: Colors.green, fontStyle: FontStyle.italic)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Future<void> _uploadFile(Map<String, dynamic> assignment) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'png'],
    );

    if (result != null) {
      // Mock Upload
      setState(() {
        assignment['status'] = 'Submitted';
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File Uploaded Successfully!')));
    }
  }
}
