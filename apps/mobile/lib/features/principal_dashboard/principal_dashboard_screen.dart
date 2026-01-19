import 'package:flutter/material.dart';
import 'widgets/approval_queue_widget.dart';
import 'widgets/staff_attendance_widget.dart';
import 'widgets/broadcast_widget.dart';

class PrincipalDashboardScreen extends StatelessWidget {
  const PrincipalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Principal Dashboard"),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const ApprovalQueueWidget(),
            const SizedBox(height: 16),
            const StaffAttendanceWidget(),
            const SizedBox(height: 16),
            const BroadcastWidget(),
          ],
        ),
      ),
    );
  }
}
