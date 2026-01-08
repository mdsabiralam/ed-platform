import 'package:flutter/material.dart';
import '../../models/live_ops_models.dart';
import 'class_block.dart';

class SchoolTimelineRow extends StatelessWidget {
  final School school;

  const SchoolTimelineRow({super.key, required this.school});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(school.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: SizedBox(
              height: 40,
              child: Row(
                children: school.timeline.map((session) {
                  return Expanded(
                    child: ClassBlock(session: session),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
