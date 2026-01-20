
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    switch (index) {
      case 0:
        // Already on home
        break;
      case 1:
        context.go('/student/diary');
        break;
      case 2:
        // Assuming a profile screen exists
        context.go('/profile-select'); // Placeholder
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Dashboard'),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => context.go('/notifications'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTodaysClasses(),
            const SizedBox(height: 24),
            _buildPendingHomework(),
            const SizedBox(height: 24),
            _buildNoticeBoard(),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book_online),
            label: 'Diary',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.teal,
        onTap: _onItemTapped,
      ),
    );
  }

  Widget _buildTodaysClasses() {
    // Dummy Data
    final classes = [
      {'time': '09:00 AM', 'subject': 'Physics', 'teacher': 'Mr. John'},
      {'time': '10:00 AM', 'subject': 'Math', 'teacher': 'Ms. Jane'},
      {'time': '11:00 AM', 'subject': 'English', 'teacher': 'Mr. Doe'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Today\'s Classes', style: GoogleFonts.lato(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...classes.map((c) => _buildClassTimelineTile(c['time']!, c['subject']!, c['teacher']!)).toList(),
      ],
    );
  }

  Widget _buildClassTimelineTile(String time, String subject, String teacher) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Text(time, style: GoogleFonts.lato(fontWeight: FontWeight.w600, color: Colors.teal)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(subject, style: GoogleFonts.lato(fontSize: 16, fontWeight: FontWeight.bold)),
                Text(teacher, style: GoogleFonts.lato(color: Colors.grey[600])),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingHomework() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pending Homework', style: GoogleFonts.lato(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListTile(
              leading: const Icon(Icons.assignment, color: Colors.redAccent),
              title: const Text('Chemistry - Chapter 5'),
              subtitle: const Text('Due: Tomorrow'),
              trailing: IconButton(icon: const Icon(Icons.arrow_forward), onPressed: () {}),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoticeBoard() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
         Text('Notice Board', style: GoogleFonts.lato(fontSize: 20, fontWeight: FontWeight.bold)),
         const SizedBox(height: 12),
         Card(
           elevation: 2,
           child: ListTile(
             leading: const Icon(Icons.campaign, color: Colors.teal),
             title: const Text('Annual Sports Day'),
             subtitle: const Text('The annual sports day will be held...'),
             onTap: () {},
           ),
         )
      ],
    );
  }
}
