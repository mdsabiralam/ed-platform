import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/parent/widgets/child_switcher.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  String _activeChildId = '1';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: ChildSwitcher(
          selectedChildId: _activeChildId,
          onChildChanged: (id) => setState(() => _activeChildId = id),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
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
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildSummaryGrid(context),
          const SizedBox(height: 24),
          const Text('Recent Updates', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildRecentUpdates(),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryGrid(context),
                const SizedBox(height: 32),
                const Text('Recent Updates', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildRecentUpdates(),
              ],
            ),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          child: Container(
            color: Colors.grey.shade50,
            child: const Center(child: Text('Calendar / Notifications Widget')),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.4,
      children: [
        _buildStatCard(context, 'Attendance', '95%', Colors.green, Icons.person, null),
        _buildStatCard(context, 'Fees Due', '\$500', Colors.red, Icons.attach_money, '/parent/fees'),
        _buildStatCard(context, 'Result', 'A+', Colors.blue, Icons.grade, null),
        _buildStatCard(context, 'Transport', 'On Route', Colors.amber, Icons.directions_bus, '/parent/tracking'),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value, Color color, IconData icon, String? route) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: route != null ? () => context.go(route) : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentUpdates() {
    return ListView(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: const [
        ListTile(
          leading: CircleAvatar(backgroundColor: Colors.blue, child: Icon(Icons.assignment, color: Colors.white, size: 16)),
          title: Text('Homework: Math Ch 5'),
          subtitle: Text('Due Tomorrow'),
        ),
        Divider(),
        ListTile(
          leading: CircleAvatar(backgroundColor: Colors.orange, child: Icon(Icons.notifications, color: Colors.white, size: 16)),
          title: Text('School Closed'),
          subtitle: Text('Due to Rain'),
        ),
      ],
    );
  }
}
