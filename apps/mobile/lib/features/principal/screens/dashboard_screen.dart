import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class PrincipalDashboardScreen extends StatelessWidget {
  const PrincipalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _buildSummaryCards(context, crossAxisCount: 2),
          const SizedBox(height: 24),
          const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildQuickActions(context),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 32),
          _buildSummaryCards(context, crossAxisCount: 4),
          const SizedBox(height: 32),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 2,
                  child: _buildRecentNotices(),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: _buildPendingActions(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final date = DateFormat.yMMMMEEEEd().format(DateTime.now());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Good Morning, Principal', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        Text(date, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }

  Widget _buildSummaryCards(BuildContext context, {required int crossAxisCount}) {
    final stats = [
      {'title': 'Attendance', 'value': '92%', 'color': Colors.blue, 'route': '/principal/attendance_report'},
      {'title': 'Fees Collected', 'value': '\$1,250', 'color': Colors.green.shade700, 'route': '/principal/fee_collection'},
      {'title': 'Pending Leaves', 'value': '4', 'color': Colors.orange.shade800, 'route': '/principal/leave_requests'},
      {'title': 'Staff Present', 'value': '45/48', 'color': Colors.purple, 'route': null},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.8,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return Card(
          elevation: 2,
          child: InkWell(
            onTap: stat['route'] != null ? () => context.go(stat['route'] as String) : null,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(stat['title'] as String, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(
                    stat['value'] as String,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: stat['color'] as Color,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      {'icon': Icons.person_add, 'label': 'Add Student', 'route': '/student/admission'},
      {'icon': Icons.sms, 'label': 'Send SMS', 'route': null},
      {'icon': Icons.group_add, 'label': 'Add Staff', 'route': '/staff/add'},
    ];

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: actions.map((action) {
        return InkWell(
          onTap: action['route'] != null ? () => context.go(action['route'] as String) : null,
          child: Column(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: Colors.blue.shade50,
                child: Icon(action['icon'] as IconData, color: const Color(0xFF0D47A1)),
              ),
              const SizedBox(height: 8),
              Text(action['label'] as String),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRecentNotices() {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Recent Notices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const Divider(height: 1),
          ListView.separated(
            shrinkWrap: true,
            itemCount: 3,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              return ListTile(
                title: Text('Notice Title ${index + 1}'),
                subtitle: const Text('Posted today'),
                leading: const Icon(Icons.campaign, color: Colors.blue),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPendingActions(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Pending Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const Divider(height: 1),
          ListTile(
            leading: const CircleAvatar(backgroundColor: Colors.orange, radius: 4),
            title: const Text('Approve Leave Request: John Doe'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => context.go('/principal/leave_requests'),
          ),
          ListTile(
            leading: const CircleAvatar(backgroundColor: Colors.red, radius: 4),
            title: const Text('Review Report Cards'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
