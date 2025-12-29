import 'package:flutter/material.dart';

class DiaryApprovalScreen extends StatelessWidget {
  const DiaryApprovalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Fetch pending diaries
    // Mock List
    final diaries = [
      {'teacher': 'Mr. Smith', 'topic': 'Algebra', 'date': '2023-10-24'},
      {'teacher': 'Mrs. Jones', 'topic': 'Biology', 'date': '2023-10-24'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Diary Approval')),
      body: ListView.builder(
        itemCount: diaries.length,
        itemBuilder: (context, index) {
          final diary = diaries[index];
          return ListTile(
            title: Text('${diary['teacher']} - ${diary['topic']}'),
            subtitle: Text(diary['date']!),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.check, color: Colors.green),
                  onPressed: () {
                    // Approve logic
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.red),
                  onPressed: () {
                    // Reject logic
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
