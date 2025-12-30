import 'package:flutter/material.dart';
import 'package:mobile/features/classroom/widgets/classroom_chat_widget.dart';

class ClassroomChatScreen extends StatelessWidget {
  final String sectionId;
  final String studentId;

  const ClassroomChatScreen({
    super.key,
    required this.sectionId,
    required this.studentId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Classroom Chat')),
      body: ClassroomChatWidget(
        sectionId: sectionId,
        studentId: studentId,
      ),
    );
  }
}
