import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/api_client.dart';

class AdminStudentListScreen extends StatefulWidget {
  const AdminStudentListScreen({super.key});

  @override
  State<AdminStudentListScreen> createState() => _AdminStudentListScreenState();
}

class _AdminStudentListScreenState extends State<AdminStudentListScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _studentList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    try {
      // Simulating API call
      await Future.delayed(const Duration(seconds: 1));
      // Uncomment below line when API is ready
      // final response = await _apiClient.get('/students');

      if (mounted) {
        setState(() {
          // Mock Data
          _studentList = [
            {'id': 1, 'name': 'Rahim Ahmed', 'class': 'Class 10', 'roll': '01'},
            {'id': 2, 'name': 'Karim Uddin', 'class': 'Class 10', 'roll': '02'},
            {'id': 3, 'name': 'Suma Akter', 'class': 'Class 9', 'roll': '05'},
          ];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student List'),
        backgroundColor: Colors.teal,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _studentList.length,
              itemBuilder: (context, index) {
                final student = _studentList[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.orange.shade100,
                      child: Text(
                        student['name'][0],
                        style: const TextStyle(color: Colors.orange),
                      ),
                    ),
                    title: Text(
                      student['name'],
                      style: GoogleFonts.lato(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${student['class']} • Roll: ${student['roll']}',
                    ),
                    trailing: const Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: Colors.grey,
                    ),
                  ),
                );
              },
            ),
    );
  }
}
