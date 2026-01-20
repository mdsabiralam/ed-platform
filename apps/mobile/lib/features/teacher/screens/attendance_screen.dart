import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/api_client.dart';

class TeacherAttendanceScreen extends StatefulWidget {
  const TeacherAttendanceScreen({super.key});

  @override
  State<TeacherAttendanceScreen> createState() =>
      _TeacherAttendanceScreenState();
}

class _TeacherAttendanceScreenState extends State<TeacherAttendanceScreen> {
  String? _selectedClass = 'Class 10';
  String? _selectedSection = 'A';
  bool _isLoading = false;

  // API Client Instance
  final ApiClient _apiClient = ApiClient();

  // List to store student data
  List<Map<String, dynamic>> _students = [];

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    setState(() => _isLoading = true);
    // Simulating API Call
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() {
        _students = List.generate(
          10,
          (index) => {
            'id': index + 1,
            'name': 'Student ${index + 1}',
            'present': true,
          },
        );
        _isLoading = false;
      });
    }
  }

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
                Expanded(
                  child: _buildDropdown(
                    ['Class 9', 'Class 10'],
                    _selectedClass,
                    'Class',
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildDropdown(
                    ['A', 'B', 'C'],
                    _selectedSection,
                    'Section',
                  ),
                ),
              ],
            ),
          ),
          _isLoading
              ? const Expanded(
                  child: Center(child: CircularProgressIndicator()),
                )
              : Expanded(
                  child: ListView.builder(
                    itemCount: _students.length,
                    itemBuilder: (context, index) {
                      final student = _students[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        elevation: 2,
                        child: ListTile(
                          title: Text(
                            student['name'],
                            style: GoogleFonts.lato(),
                          ),
                          trailing: Switch(
                            value: student['present'],
                            onChanged: (value) {
                              setState(() {
                                student['present'] = value;
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
        onPressed: () async {
          // Simulating Save API Call
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Saving...')));
          await Future.delayed(const Duration(seconds: 1));
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
        return DropdownMenuItem<String>(value: item, child: Text(item));
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
