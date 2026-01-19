import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:go_router/go_router.dart';

// Enum for System Status
enum SystemStatus { HEALTHY, WARN, DOWN }

class SuperAdminDashboardScreen extends StatelessWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Dashboard'),
        backgroundColor: const Color(0xFF0D47A1), // Deep Blue
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          } else {
            return _buildMobileLayout(context);
          }
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatsGrid(context, crossAxisCount: 2),
            const SizedBox(height: 24),
            _buildRevenueChart(),
            const SizedBox(height: 24),
            _buildRecentTenantsList(context),
          ],
        ),
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatsGrid(context, crossAxisCount: 4),
          const SizedBox(height: 32),
          _buildRevenueChart(),
          const SizedBox(height: 32),
          _buildRecentTenantsTable(context),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(BuildContext context, {required int crossAxisCount}) {
    // Dummy Data
    final stats = [
      {'title': 'Total Schools', 'value': '124', 'color': Colors.blue, 'route': '/super-admin/tenants'},
      {'title': 'Total MRR', 'value': '\$45,200', 'color': Colors.amber, 'route': '/super-admin/plans'},
      {'title': 'Active Users', 'value': '12,500', 'color': Colors.green, 'route': null},
      {'title': 'Server Health', 'value': 'Healthy', 'status': SystemStatus.HEALTHY, 'route': null},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 1.5,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return _buildStatCard(context, stat);
      },
    );
  }

  Widget _buildStatCard(BuildContext context, Map<String, dynamic> stat) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: stat['route'] != null ? () => context.go(stat['route']) : null,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(stat['title'], style: Theme.of(context).textTheme.titleSmall),
              const SizedBox(height: 8),
              if (stat.containsKey('status'))
                Row(
                  children: [
                     Icon(Icons.circle, color: stat['status'] == SystemStatus.HEALTHY ? Colors.green : Colors.red, size: 12),
                     const SizedBox(width: 8),
                     Text(stat['value'], style: Theme.of(context).textTheme.headlineMedium),
                  ],
                )
              else
                Text(
                  stat['value'],
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: stat['color'] ?? Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRevenueChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Revenue Growth', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(show: false),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: true, getTitlesWidget: (value, meta) {
                        switch(value.toInt()) {
                          case 0: return const Text('Jan');
                          case 2: return const Text('Mar');
                          case 4: return const Text('May');
                          case 6: return const Text('Jul');
                          default: return const Text('');
                        }
                      }),
                    ),
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: true, border: Border.all(color: const Color(0xff37434d), width: 1)),
                  minX: 0,
                  maxX: 6,
                  minY: 0,
                  maxY: 6,
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 3),
                        FlSpot(1, 1),
                        FlSpot(2, 4),
                        FlSpot(3, 3),
                        FlSpot(4, 5),
                        FlSpot(5, 4),
                        FlSpot(6, 5),
                      ],
                      isCurved: true,
                      color: Colors.blue,
                      barWidth: 4,
                      isStrokeCapRound: true,
                      dotData: FlDotData(show: false),
                      belowBarData: BarAreaData(show: false),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTenantsList(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recently Added Schools', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 5,
          itemBuilder: (context, index) {
            return Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.school)),
                title: Text('School $index'),
                subtitle: Text('Plan: Pro • Joined: 2023-10-${10+index}'),
                trailing: TextButton(
                  onPressed: () => context.go('/super-admin/tenants/details/$index'),
                  child: const Text('Manage'),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildRecentTenantsTable(BuildContext context) {
     return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recently Added Schools', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Card(
          child: SizedBox(
            width: double.infinity,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('School Name')),
                DataColumn(label: Text('Plan')),
                DataColumn(label: Text('Status')),
                DataColumn(label: Text('Joined Date')),
                DataColumn(label: Text('Actions')),
              ],
              rows: List.generate(5, (index) {
                return DataRow(cells: [
                  DataCell(Text('School $index')),
                  const DataCell(Text('Pro')),
                  const DataCell(Text('Active', style: TextStyle(color: Colors.green))),
                  DataCell(Text('2023-10-${10+index}')),
                  DataCell(
                    TextButton(
                      onPressed: () => context.go('/super-admin/tenants/details/$index'),
                      child: const Text('Manage'),
                    ),
                  ),
                ]);
              }),
            ),
          ),
        ),
      ],
    );
  }
}
