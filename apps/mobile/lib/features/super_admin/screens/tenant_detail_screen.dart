import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TenantDetailScreen extends StatelessWidget {
  final String tenantId;
  const TenantDetailScreen({super.key, required this.tenantId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('School Details: $tenantId'), // Mock name
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
      child: Column(
        children: [
          _buildProfileCard(context),
          const Divider(),
          _buildStatsPanel(context),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 300,
            child: _buildProfileCard(context),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: _buildStatsPanel(context),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(radius: 40, child: Icon(Icons.school, size: 40)),
            const SizedBox(height: 16),
            const Text('St. Xavier\'s School', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const Text('xavier.ed.app', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green.shade100,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text('Active', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.edit),
                label: const Text('Edit Details'),
                onPressed: () => context.go('/super-admin/tenants/edit/$tenantId'),
              ),
            ),
             const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.vpn_key),
                label: const Text('Impersonate Admin'),
                onPressed: () {
                   // Impersonate logic
                },
              ),
            ),
             const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.block),
                label: const Text('Suspend School'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                onPressed: () {
                  // Show confirmation dialog
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsPanel(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Subscription & Usage', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildStatRow('Plan', 'Enterprise'),
            _buildStatRow('Next Billing', '24 Oct 2024'),
            const Divider(height: 32),
             const Text('Platform Stats', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                 _buildInfoTile('Students', '1,240'),
                 _buildInfoTile('Teachers', '85'),
                 _buildInfoTile('Storage', '45 GB'),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
