import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  String _selectedChild = 'Rahim';
  final Map<String, Map<String, dynamic>> _childData = {
    'Rahim': {'attendance': '95%', 'feeDue': false, 'result': 'A+'},
    'Karim': {'attendance': '80%', 'feeDue': true, 'result': 'B'},
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Dashboard'),
        backgroundColor: Colors.teal,
        actions: [
          _buildChildSwitcher(),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final bool? confirm = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Are you sure you want to logout?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text(
                        'Logout',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              );

              if (confirm == true && context.mounted) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.clear();
                if (context.mounted) context.go('/login');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildSummaryCards(),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go('/parent/vehicle-tracking'),
              icon: const Icon(Icons.directions_bus),
              label: const Text('Live Vehicle Tracking'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                minimumSize: const Size(double.infinity, 50),
                textStyle: GoogleFonts.lato(fontSize: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChildSwitcher() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0),
      child: DropdownButton<String>(
        value: _selectedChild,
        icon: const Icon(Icons.child_care, color: Colors.white),
        dropdownColor: Colors.teal,
        underline: Container(),
        onChanged: (String? newValue) {
          if (newValue != null) {
            setState(() {
              _selectedChild = newValue;
            });
          }
        },
        items: <String>['Rahim', 'Karim'].map<DropdownMenuItem<String>>((
          String value,
        ) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(
              value,
              style: GoogleFonts.lato(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSummaryCards() {
    final data = _childData[_selectedChild]!;
    return GridView.count(
      key: ValueKey(
        _selectedChild,
      ), // চাইল্ড পরিবর্তনের সাথে সাথে UI রিফ্রেশ হবে
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildInfoCard(
          'Attendance',
          data['attendance'],
          Icons.check_circle_outline,
          Colors.green,
        ),
        _buildInfoCard(
          'Fee Status',
          data['feeDue'] ? 'Due' : 'Paid',
          Icons.receipt,
          data['feeDue'] ? Colors.red : Colors.teal,
          onTap: data['feeDue']
              ? () => context.go('/parent/payment-gateway')
              : null,
        ),
        _buildInfoCard(
          'Recent Result',
          data['result'],
          Icons.grade,
          Colors.blue,
        ),
      ],
    );
  }

  Widget _buildInfoCard(
    String title,
    String value,
    IconData icon,
    Color color, {
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              colors: [color.withOpacity(0.8), color],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: Colors.white, size: 32),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.lato(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    value,
                    style: GoogleFonts.lato(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
