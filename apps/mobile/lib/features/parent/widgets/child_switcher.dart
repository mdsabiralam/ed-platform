import 'package:flutter/material.dart';

class ChildSwitcher extends StatelessWidget {
  final String selectedChildId;
  final ValueChanged<String> onChildChanged;

  const ChildSwitcher({
    super.key,
    required this.selectedChildId,
    required this.onChildChanged,
  });

  // Mock Children Data
  final List<Map<String, dynamic>> _children = const [
    {'id': '1', 'name': 'Alice', 'class': 'Class 5'},
    {'id': '2', 'name': 'Bob', 'class': 'Class 10'},
  ];

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      onSelected: onChildChanged,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            backgroundColor: Colors.indigo.shade100,
            child: Text(
              _children.firstWhere((c) => c['id'] == selectedChildId)['name'][0],
              style: TextStyle(color: Colors.indigo.shade900),
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _children.firstWhere((c) => c['id'] == selectedChildId)['name'],
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Text(
                _children.firstWhere((c) => c['id'] == selectedChildId)['class'],
                style: const TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          ),
          const Icon(Icons.arrow_drop_down),
        ],
      ),
      itemBuilder: (context) {
        return _children.map((child) {
          return PopupMenuItem(
            value: child['id'],
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: selectedChildId == child['id'] ? Colors.green : Colors.grey.shade200,
                  child: Text(child['name'][0]),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(child['name']),
                    Text(child['class'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ],
            ),
          );
        }).toList();
      },
    );
  }
}
