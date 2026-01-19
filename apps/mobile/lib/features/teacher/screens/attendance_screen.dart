import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

// Mock Student Model
class StudentAttendance {
  final String id;
  final String name;
  final int rollNo;
  String status; // 'P', 'A', 'L', 'LE' (Leave)

  StudentAttendance({required this.id, required this.name, required this.rollNo, this.status = 'P'});
}

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final String _className = 'Class 10 - Section A';
  final String _date = DateFormat.yMMMMEEEEd().format(DateTime.now());

  // Mock Data
  final List<StudentAttendance> _students = List.generate(
    30,
    (index) => StudentAttendance(id: '$index', name: 'Student ${index + 1}', rollNo: index + 1)
  );

  void _toggleStatus(int index) {
    setState(() {
      if (_students[index].status == 'P') {
        _students[index].status = 'A';
      } else {
        _students[index].status = 'P';
      }
    });
  }

  void _showStatusMenu(int index, BuildContext context) async {
    final result = await showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(100, 100, 100, 100), // Needs actual tap position logic in real app
      items: [
        const PopupMenuItem(value: 'L', child: Text('Late (Yellow)')),
        const PopupMenuItem(value: 'LE', child: Text('Leave (Blue)')),
      ],
    );

    if (result != null) {
      setState(() {
        _students[index].status = result;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'P': return Colors.green.shade600;
      case 'A': return Colors.redAccent;
      case 'L': return Colors.amber;
      case 'LE': return Colors.blue;
      default: return Colors.grey;
    }
  }

  void _submitAttendance() {
    // Mock API Logic / Offline Sync
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance Saved & Synced!')));
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_className, style: const TextStyle(fontSize: 16)),
            Text(_date, style: const TextStyle(fontSize: 12)),
          ],
        ),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _submitAttendance,
        icon: const Icon(Icons.check),
        label: const Text('Submit'),
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
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: _students.length,
      itemBuilder: (context, index) {
        final student = _students[index];
        return GestureDetector(
          onTap: () => _toggleStatus(index),
          onLongPress: () => _showStatusMenu(index, context),
          child: Container(
            decoration: BoxDecoration(
              color: _getStatusColor(student.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _getStatusColor(student.status), width: 2),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  backgroundColor: _getStatusColor(student.status),
                  child: Text(student.rollNo.toString(), style: const TextStyle(color: Colors.white)),
                ),
                const SizedBox(height: 8),
                Text(student.name, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                Text(student.status, style: TextStyle(color: _getStatusColor(student.status), fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Card(
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Roll No')),
            DataColumn(label: Text('Name')),
            DataColumn(label: Text('Present')),
            DataColumn(label: Text('Absent')),
            DataColumn(label: Text('Late')),
            DataColumn(label: Text('Leave')),
            DataColumn(label: Text('Remarks')),
          ],
          rows: _students.asMap().entries.map((entry) {
            final index = entry.key;
            final student = entry.value;
            return DataRow(
              cells: [
                DataCell(Text(student.rollNo.toString())),
                DataCell(Text(student.name)),
                DataCell(Radio(value: 'P', groupValue: student.status, onChanged: (v) => setState(() => student.status = v!))),
                DataCell(Radio(value: 'A', groupValue: student.status, onChanged: (v) => setState(() => student.status = v!))),
                DataCell(Radio(value: 'L', groupValue: student.status, onChanged: (v) => setState(() => student.status = v!))),
                DataCell(Radio(value: 'LE', groupValue: student.status, onChanged: (v) => setState(() => student.status = v!))),
                const DataCell(TextField(decoration: InputDecoration(hintText: 'Optional'))),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
