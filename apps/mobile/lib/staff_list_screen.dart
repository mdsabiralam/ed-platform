import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/api_client.dart';

class AdminStaffListScreen extends StatefulWidget {
  const AdminStaffListScreen({super.key});

  @override
  State<AdminStaffListScreen> createState() => _AdminStaffListScreenState();
}

class _AdminStaffListScreenState extends State<AdminStaffListScreen> {
  final ApiClient _apiClient = ApiClient();
  List<dynamic> _staffList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchStaff();
  }

  Future<void> _fetchStaff() async {
    try {
      // Simulating API call
      await Future.delayed(const Duration(seconds: 1));
      // Uncomment below line when API is ready
      // final response = await _apiClient.get('/staff');

      if (mounted) {
        setState(() {
          // Mock Data
          _staffList = [
            {
              'id': 1,
              'name': 'Mr. John Doe',
              'role': 'Teacher',
              'subject': 'Math',
            },
            {
              'id': 2,
              'name': 'Ms. Jane Smith',
              'role': 'Teacher',
              'subject': 'English',
            },
            {
              'id': 3,
              'name': 'Mr. Robert Brown',
              'role': 'Driver',
              'vehicle': 'Bus 1',
            },
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
        title: const Text('Staff List'),
        backgroundColor: Colors.teal,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _staffList.length,
              itemBuilder: (context, index) {
                final staff = _staffList[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.teal.shade100,
                      child: Text(
                        staff['name'][0],
                        style: const TextStyle(color: Colors.teal),
                      ),
                    ),
                    title: Text(
                      staff['name'],
                      style: GoogleFonts.lato(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${staff['role']} ${staff['subject'] != null ? '• ${staff['subject']}' : ''}',
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
