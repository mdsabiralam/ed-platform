import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class StudentDashboardScreen extends StatelessWidget {
  const StudentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.notifications), onPressed: () {}),
        ],
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
          _buildNextClassCard(),
          const SizedBox(height: 16),
          _buildDueFeeAlert(context),
          const SizedBox(height: 16),
          _buildNoticeCarousel(),
          const SizedBox(height: 24),
          _buildQuickLinks(context),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                _buildNextClassCard(),
                const SizedBox(height: 24),
                _buildDueFeeAlert(context),
                const SizedBox(height: 24),
                const Text('Performance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildPerformanceGraph(),
              ],
            ),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 2,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Text('Notice Board', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildNoticeList(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNextClassCard() {
    final now = DateTime.now();
    // Time Awareness Logic
    final isActive = now.hour >= 9 && now.hour < 15; // School hours
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: isActive ? [Colors.teal, Colors.teal.shade700] : [Colors.grey, Colors.grey.shade700],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(isActive ? 'Active Now' : 'Next Class', style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
                if (isActive) const Icon(Icons.circle, color: Colors.greenAccent, size: 10),
              ],
            ),
            const SizedBox(height: 8),
            const Text('Physics', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
            const Text('Mr. Newton • Room 302', style: TextStyle(color: Colors.white70, fontSize: 16)),
            const SizedBox(height: 16),
            Text(DateFormat.jm().format(now), style: const TextStyle(color: Colors.white, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildDueFeeAlert(BuildContext context) {
    // Mock Fee Logic
    const feeDue = 2500;
    if (feeDue <= 0) return const SizedBox.shrink();

    return InkWell(
      onTap: () => context.go('/finance/pay'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red.shade200),
        ),
        child: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 32),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Fee Payment Overdue', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  Text('Total Due: \$2,500', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.red, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildNoticeCarousel() {
    return SizedBox(
      height: 150,
      child: PageView.builder(
        itemCount: 3,
        itemBuilder: (context, index) {
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.teal.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Notice ${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                const Text('School will remain closed tomorrow due to heavy rain forecast.', textAlign: TextAlign.center),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickLinks(BuildContext context) {
    final links = [
      {'icon': Icons.book, 'label': 'Homework', 'route': '/student/diary'},
      {'icon': Icons.schedule, 'label': 'Routine', 'route': '/student/routine'},
      {'icon': Icons.library_books, 'label': 'Library', 'route': '/library/search'},
      {'icon': Icons.psychology, 'label': 'AI Help', 'route': '/ai/chat'},
      {'icon': Icons.assignment_turned_in, 'label': 'Result', 'route': '/portal/report-card'}, // Corrected route
    ];

    return Wrap(
      spacing: 16,
      runSpacing: 16,
      alignment: WrapAlignment.center,
      children: links.map((link) {
        return GestureDetector(
          onTap: () => context.go(link['route'] as String),
          child: Column(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.teal.shade100,
                child: Icon(link['icon'] as IconData, color: Colors.teal.shade800),
              ),
              const SizedBox(height: 8),
              Text(link['label'] as String, style: const TextStyle(fontSize: 12)),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPerformanceGraph() {
    return Container(
      height: 200,
      color: Colors.grey.shade100,
      child: const Center(child: Text('Performance Graph (Mock)')),
    );
  }

  Widget _buildNoticeList() {
    return ListView.separated(
      shrinkWrap: true,
      itemCount: 5,
      separatorBuilder: (c, i) => const Divider(),
      itemBuilder: (c, i) => ListTile(
        title: Text('Notice Title ${i + 1}'),
        subtitle: const Text('2 hours ago'),
        leading: const Icon(Icons.campaign, color: Colors.teal),
      ),
    );
  }
}
