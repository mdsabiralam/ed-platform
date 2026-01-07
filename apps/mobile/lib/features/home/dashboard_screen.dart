import 'package:flutter/material.dart';
import 'package:mobile/core/services/voice_service.dart';
import 'package:mobile/core/widgets/voice_text_field.dart';
import 'package:mobile/features/voice/voice_command_fab.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ed Platform Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // Navigate to settings if needed
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome Back!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            // Example of Voice Typing Field integration (Prompt 6)
            const Text('Quick Notes (Voice Typing):'),
            const SizedBox(height: 8),
            VoiceTextField(
              controller: TextEditingController(),
              hintText: 'Tap mic to dictate notes...',
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                children: [
                  _buildDashboardCard(
                    context,
                    'Fees & Dues',
                    Icons.monetization_on,
                    Colors.green,
                    () {}
                  ),
                  _buildDashboardCard(
                    context,
                    'Results',
                    Icons.assessment,
                    Colors.blue,
                    () {}
                  ),
                  _buildDashboardCard(
                    context,
                    'Attendance',
                    Icons.calendar_today,
                    Colors.orange,
                    () {}
                  ),
                  _buildDashboardCard(
                    context,
                    'Classes',
                    Icons.class_,
                    Colors.purple,
                    () {}
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      // Voice Command FAB (Prompt 7)
      floatingActionButton: const VoiceCommandFab(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildDashboardCard(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
