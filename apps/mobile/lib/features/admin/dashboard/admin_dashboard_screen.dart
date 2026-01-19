import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/ui/responsive_layout.dart';
import 'package:mobile/features/admin/widgets/stat_card.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: ResponsiveLayout(
        mobileBody: const _MobileLayout(),
        tabletBody: const _DesktopLayout(isTablet: true),
        desktopBody: const _DesktopLayout(),
      ),
    );
  }
}

class _MobileLayout extends StatelessWidget {
  const _MobileLayout({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Super Admin',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Theme.of(context).cardColor,
        elevation: 0,
        iconTheme: IconThemeData(color: isDark ? Colors.white : const Color(0xFF0F172A)),
      ),
      drawer: const _AdminSidebar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _StatsGrid(crossAxisCount: 1),
            const SizedBox(height: 24),
            const _RevenueChartSection(),
            const SizedBox(height: 24),
            const _TenantTableSection(),
          ],
        ),
      ),
    );
  }
}

class _DesktopLayout extends StatelessWidget {
  final bool isTablet;

  const _DesktopLayout({Key? key, this.isTablet = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      children: [
        const SizedBox(
          width: 280,
          child: _AdminSidebar(),
        ),
        Expanded(
          child: Column(
            children: [
              Container(
                height: 80,
                color: Theme.of(context).cardColor,
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Dashboard',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                    ),
                    const CircleAvatar(
                      backgroundColor: Color(0xFFE2E8F0),
                      child: Icon(Icons.person, color: Color(0xFF0F172A)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _StatsGrid(crossAxisCount: isTablet ? 2 : 4),
                      const SizedBox(height: 32),
                      const _RevenueChartSection(),
                      const SizedBox(height: 32),
                      const _TenantTableSection(),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AdminSidebar extends StatelessWidget {
  const _AdminSidebar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      color: Theme.of(context).cardColor,
      child: Column(
        children: [
          const SizedBox(height: 32),
          Text(
            'ed.',
            style: GoogleFonts.poppins(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 48),
          _SidebarItem(
            icon: Icons.dashboard_rounded,
            title: 'Dashboard',
            isActive: true,
            onTap: () {},
          ),
          _SidebarItem(
            icon: Icons.school_rounded,
            title: 'Schools',
            onTap: () {},
          ),
          _SidebarItem(
            icon: Icons.people_rounded,
            title: 'Users',
            onTap: () {},
          ),
          _SidebarItem(
            icon: Icons.monetization_on_rounded,
            title: 'Revenue',
            onTap: () {},
          ),
          _SidebarItem(
            icon: Icons.settings_rounded,
            title: 'Settings',
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isActive;
  final VoidCallback onTap;

  const _SidebarItem({
    Key? key,
    required this.icon,
    required this.title,
    this.isActive = false,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final activeColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final inactiveColor = isDark ? Colors.grey[400] : const Color(0xFF94A3B8);

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        decoration: BoxDecoration(
          border: isActive
              ? Border(
                  right: BorderSide(color: activeColor, width: 4),
                )
              : null,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isActive ? activeColor : inactiveColor,
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive ? activeColor : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final int crossAxisCount;

  const _StatsGrid({Key? key, required this.crossAxisCount}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final children = [
      const StatCard(
        title: 'Total Revenue (MRR)',
        value: '\$45,231',
        subtitle: '12% vs last month',
        icon: Icons.attach_money_rounded,
        color: Colors.blue,
      ),
      const StatCard(
        title: 'Active Schools',
        value: '124',
        subtitle: '3 new this week',
        icon: Icons.apartment_rounded,
        color: Colors.purple,
      ),
      const StatCard(
        title: 'Total Students',
        value: '12,504',
        subtitle: 'Active Listeners',
        icon: Icons.people_outline_rounded,
        color: Colors.orange,
      ),
      const StatCard(
        title: 'System Health',
        value: '99.9%',
        subtitle: 'All Systems Operational',
        icon: Icons.health_and_safety_rounded,
        color: Colors.green,
      ),
    ];

    if (crossAxisCount == 1) {
      return Column(
        children: children
            .map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: e,
                ))
            .toList(),
      );
    }

    return GridView.count(
      crossAxisCount: crossAxisCount,
      crossAxisSpacing: 24,
      mainAxisSpacing: 24,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: children,
    );
  }
}

class _RevenueChartSection extends StatelessWidget {
  const _RevenueChartSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 400,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Revenue Trends',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: 1,
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
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
                      FlSpot(3, 2),
                      FlSpot(4, 5),
                      FlSpot(5, 3),
                      FlSpot(6, 4),
                    ],
                    isCurved: true,
                    gradient: const LinearGradient(
                      colors: [Colors.blue, Colors.purple],
                    ),
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          Colors.blue.withOpacity(0.3),
                          Colors.purple.withOpacity(0.1),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TenantTableSection extends StatelessWidget {
  const _TenantTableSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subTextColor = isDark ? Colors.grey[400] : const Color(0xFF64748B);

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Tenants',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add),
                label: const Text('New School'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingTextStyle: GoogleFonts.inter(
                fontWeight: FontWeight.w600,
                color: subTextColor,
              ),
              dataTextStyle: GoogleFonts.inter(
                color: textColor,
                fontWeight: FontWeight.w500,
              ),
              columns: const [
                DataColumn(label: Text('School Name')),
                DataColumn(label: Text('Plan')),
                DataColumn(label: Text('Status')),
                DataColumn(label: Text('Actions')),
              ],
              rows: [
                _buildRow(context, 'Dhaka High School', 'Gold Plan', 'Active'),
                _buildRow(context, 'Green Dale Academy', 'Silver Plan', 'Active'),
                _buildRow(context, 'Sunrise Kindergarten', 'Gold Plan', 'Locked'),
                _buildRow(context, 'Blue Bird School', 'Silver Plan', 'Active'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  DataRow _buildRow(BuildContext context, String name, String plan, String status) {
    final isLocked = status == 'Locked';
    return DataRow(
      cells: [
        DataCell(Text(name)),
        DataCell(
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: plan.contains('Gold')
                  ? Colors.amber.withOpacity(0.1)
                  : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              plan,
              style: TextStyle(
                color: plan.contains('Gold') ? Colors.amber[800] : Colors.grey[700],
                fontSize: 12,
              ),
            ),
          ),
        ),
        DataCell(
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: isLocked
                  ? Colors.red.withOpacity(0.1)
                  : Colors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: isLocked ? Colors.red : Colors.green,
                fontSize: 12,
              ),
            ),
          ),
        ),
        DataCell(
          Row(
            children: [
              TextButton(
                onPressed: () {},
                child: const Text('Login'),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: Icon(
                  isLocked ? Icons.lock_open : Icons.lock_outline,
                  color: isLocked ? Colors.green : Colors.red,
                  size: 20,
                ),
                onPressed: () {},
              ),
            ],
          ),
        ),
      ],
    );
  }
}
