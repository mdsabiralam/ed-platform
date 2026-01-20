
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Admin Dashboard', style: GoogleFonts.lato()),
        backgroundColor: Colors.teal,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Key Metrics',
              style: GoogleFonts.lato(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildStatsGraphs(),
            const SizedBox(height: 24),
            Text(
              'Management',
              style: GoogleFonts.lato(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildManagementMenu(context),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGraphs() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildGraphCard('Fee Collection', '85%', Colors.green),
        _buildGraphCard('Attendance', '92%', Colors.blue),
      ],
    );
  }

  Widget _buildGraphCard(String title, String value, Color color) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.lato(fontSize: 16, color: Colors.grey[600])),
            const SizedBox(height: 8),
            Text(value, style: GoogleFonts.lato(fontSize: 32, fontWeight: FontWeight.bold, color: color)),
            const Expanded(child: SizedBox()),
            Container(
              height: 50,
              color: color.withOpacity(0.2),
              // Placeholder for graph
            )
          ],
        ),
      ),
    );
  }

  Widget _buildManagementMenu(BuildContext context) {
    return Column(
      children: [
        _buildMenuTile(context, 'Staff Management', Icons.people, '/admin/staff-list'),
        _buildMenuTile(context, 'Student Admissions', Icons.person_add, '/admin/student-list'), // Simplified route
        _buildMenuTile(context, 'Post Notices', Icons.campaign, '/notifications'), // Simplified route
      ],
    );
  }

  Widget _buildMenuTile(BuildContext context, String title, IconData icon, String route) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        leading: Icon(icon, color: Colors.teal),
        title: Text(title, style: GoogleFonts.lato(fontWeight: FontWeight.w600)),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: () => context.go(route),
      ),
    );
  }
}
