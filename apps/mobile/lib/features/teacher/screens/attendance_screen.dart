
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TeacherAttendanceScreen extends StatefulWidget {
  const TeacherAttendanceScreen({super.key});

  @override
  State<TeacherAttendanceScreen> createState() => _TeacherAttendanceScreenState();
}

class _TeacherAttendanceScreenState extends State<TeacherAttendanceScreen> {
  String? _selectedClass = 'Class 10';
  String? _selectedSection = 'A';
  final Map<String, bool> _attendance = {
    'Student 1': true,
    'Student 2': true,
    'Student 3': false,
    'Student 4': true,
    'Student 5': true,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mark Attendance'),
        backgroundColor: Colors.teal,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(child: _buildDropdown(['Class 9', 'Class 10'], _selectedClass, 'Class')),
                const SizedBox(width: 16),
                Expanded(child: _buildDropdown(['A', 'B', 'C'], _selectedSection, 'Section')),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _attendance.length,
              itemBuilder: (context, index) {
                String studentName = _attendance.keys.elementAt(index);
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  elevation: 2,
                  child: ListTile(
                    title: Text(studentName, style: GoogleFonts.lato()),
                    trailing: Switch(
                      value: _attendance[studentName]!,
                      onChanged: (value) {
                        setState(() {
                          _attendance[studentName] = value;
                        });
                      },
                      activeColor: Colors.teal,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Attendance Saved Successfully!')),
          );
        },
        icon: const Icon(Icons.save),
        label: const Text('Save Attendance'),
        backgroundColor: Colors.teal,
      ),
    );
  }

  Widget _buildDropdown(List<String> items, String? value, String hint) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        labelText: hint,
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
      ),
      items: items.map((String item) {
        return DropdownMenuItem<String>(
          value: item,
          child: Text(item),
        );
      }).toList(),
      onChanged: (newValue) {
        setState(() {
          if (hint == 'Class') {
            _selectedClass = newValue;
          } else {
            _selectedSection = newValue;
          }
        });
      },
    );
  }
}
