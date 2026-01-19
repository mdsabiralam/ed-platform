import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class TeacherDashboardScreen extends StatelessWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hello, Mr. Anderson'),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLiveClassCard(context),
          const SizedBox(height: 24),
          const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildQuickActionsGrid(context),
          const SizedBox(height: 24),
          const Text('Upcoming Events', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildUpcomingEvents(),
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
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Weekly Timetable', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildWeeklyTimetable(),
              ],
            ),
          ),
        ),
        Container(width: 1, color: Colors.grey.shade300),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildLiveClassCard(context),
                const SizedBox(height: 32),
                const Text('Pending Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _buildTaskList(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLiveClassCard(BuildContext context) {
    // Time Awareness Mock
    final now = DateTime.now();
    final isClassTime = now.hour >= 9 && now.hour < 16;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isClassTime
             ? [Colors.blue.shade800, Colors.blue.shade500]
             : [Colors.grey.shade700, Colors.grey.shade500],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(isClassTime ? 'Active Now' : 'Next Class', style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
              if (isClassTime) const Icon(Icons.circle, color: Colors.greenAccent, size: 12),
            ],
          ),
          const SizedBox(height: 8),
          const Text('Mathematics - Class 10 B', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
          const Text('Room 101', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => context.go('/teacher/attendance/take'),
            icon: const Icon(Icons.check_circle),
            label: const Text('Take Attendance'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.blue.shade900,
              minimumSize: const Size(double.infinity, 48),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsGrid(BuildContext context) {
    final actions = [
      {'icon': Icons.assignment, 'label': 'Attendance', 'route': '/teacher/attendance/history'},
      {'icon': Icons.book, 'label': 'Homework', 'route': '/academic/homework'},
      {'icon': Icons.grade, 'label': 'Marks Entry', 'route': '/academic/marks/entry'},
      {'icon': Icons.time_to_leave, 'label': 'Apply Leave', 'route': '/hr/leave'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 2.5,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return Card(
          elevation: 2,
          child: InkWell(
            onTap: action['route'] != null ? () => context.go(action['route'] as String) : null,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(action['icon'] as IconData, color: Colors.teal),
                const SizedBox(width: 12),
                Text(action['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildUpcomingEvents() {
    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        itemBuilder: (context, index) {
          return Container(
            width: 200,
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.teal.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.teal.shade100),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(DateFormat.MMMEd().format(DateTime.now().add(Duration(days: index))), style: const TextStyle(color: Colors.teal, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Staff Meeting ${index + 1}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Text('Conference Hall', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildWeeklyTimetable() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Table(
          border: TableBorder.all(color: Colors.grey.shade200),
          children: [
            const TableRow(
              decoration: BoxDecoration(color: Colors.teal),
              children: [
                Padding(padding: EdgeInsets.all(8), child: Text('Day', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                Padding(padding: EdgeInsets.all(8), child: Text('09:00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                Padding(padding: EdgeInsets.all(8), child: Text('10:00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                Padding(padding: EdgeInsets.all(8), child: Text('11:00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
              ],
            ),
            ...List.generate(5, (index) {
              final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
              return TableRow(
                children: [
                  Padding(padding: const EdgeInsets.all(8), child: Text(days[index], style: const TextStyle(fontWeight: FontWeight.bold))),
                  const Padding(padding: EdgeInsets.all(8), child: Text('Math (10A)')),
                  const Padding(padding: EdgeInsets.all(8), child: Text('Science (9B)')),
                  const Padding(padding: EdgeInsets.all(8), child: Text('Free')),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskList() {
    return ListView(
      shrinkWrap: true,
      children: [
        ListTile(
          leading: const CircleAvatar(backgroundColor: Colors.redAccent, radius: 5),
          title: const Text('Submit Class 10 Marks'),
          subtitle: const Text('Due Today'),
          trailing: ElevatedButton(onPressed: () {}, child: const Text('Do Now')),
        ),
        const Divider(),
        ListTile(
          leading: const CircleAvatar(backgroundColor: Colors.orange, radius: 5),
          title: const Text('Approve Leave: John Doe'),
          subtitle: const Text('Pending approval'),
          trailing: ElevatedButton(onPressed: () {}, child: const Text('View')),
        ),
      ],
    );
  }
}
