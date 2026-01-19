import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  final String parentId;
  const DashboardScreen({super.key, required this.parentId});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Mock data for children since we can't easily call backend here without full setup
  // In real app, this would come from ParentService via BLoC
  List<Map<String, dynamic>> children = [
    {'id': '1', 'name': 'Child A', 'class': 'Class 5'},
    {'id': '2', 'name': 'Child B', 'class': 'Class 10'},
  ];

  late String currentChildId;

  @override
  void initState() {
    super.initState();
    currentChildId = children.first['id'];
  }

  void _switchChild(String? newChildId) {
    if (newChildId != null) {
      setState(() {
        currentChildId = newChildId;
      });
      // Trigger data refresh here for Fees, Results, Diary
      print("Switched to child: $newChildId");
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentChild = children.firstWhere((c) => c['id'] == currentChildId);

    return Scaffold(
      appBar: AppBar(
        title: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: currentChildId,
            icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
            dropdownColor: Colors.blue,
            style: const TextStyle(color: Colors.white, fontSize: 18),
            items: children.map((child) {
              return DropdownMenuItem<String>(
                value: child['id'],
                child: Text("${child['name']} (${child['class']})"),
              );
            }).toList(),
            onChanged: _switchChild,
          ),
        ),
        backgroundColor: Colors.blue,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
             _buildSummaryCard(currentChild, "Fees", "Pending: $500", Icons.attach_money, () {
               // Navigation to Fees Screen would happen here via GoRouter
               // context.push('/fees/$currentChildId');
             }),
             _buildSummaryCard(currentChild, "Results", "Last Exam: 85%", Icons.assessment, () {}),
             _buildSummaryCard(currentChild, "Diary", "2 new notes", Icons.book, () {}),
             _buildSummaryCard(currentChild, "Bus Tracking", "Live", Icons.directions_bus, () {
               // context.push('/tracking/bus-123');
             }),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> child, String title, String value, IconData icon, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: ListTile(
        leading: Icon(icon, color: Colors.blue, size: 40),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(value),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
}
