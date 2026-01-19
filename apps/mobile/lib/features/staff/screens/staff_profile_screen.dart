import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
// import 'package:pdf/pdf.dart'; // Will use mock logic
// import 'package:pdf/widgets.dart' as pw; // Will use mock logic

class StaffProfileScreen extends StatelessWidget {
  final String staffId;
  const StaffProfileScreen({super.key, required this.staffId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MediaQuery.of(context).size.width <= 800
          ? null // Handled by SliverAppBar in Mobile
          : AppBar(
              title: Text('Staff > Staff Name $staffId'),
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
    return DefaultTabController(
      length: 3,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 250.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF0D47A1),
              flexibleSpace: FlexibleSpaceBar(
                title: Text('Staff Name $staffId', style: const TextStyle(fontSize: 16)),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      'https://via.placeholder.com/300',
                      fit: BoxFit.cover,
                    ),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment(0.0, 0.5),
                          end: Alignment(0.0, 0.0),
                          colors: <Color>[
                            Color(0x60000000),
                            Color(0x00000000),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                const TabBar(
                  labelColor: Colors.black87,
                  unselectedLabelColor: Colors.grey,
                  tabs: [
                    Tab(text: 'Info'),
                    Tab(text: 'Attendance'),
                    Tab(text: 'Payroll'),
                  ],
                ),
              ),
              pinned: true,
            ),
          ];
        },
        body: TabBarView(
          children: [
            _buildInfoTab(),
            _buildAttendanceTab(),
            _buildPayrollTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: _buildProfileCard(context),
            ),
            const SizedBox(width: 24),
            Expanded(
              flex: 7,
              child: Column(
                children: [
                  const TabBar(
                    labelColor: Color(0xFF0D47A1),
                    unselectedLabelColor: Colors.grey,
                    tabs: [
                      Tab(text: 'Info'),
                      Tab(text: 'Attendance'),
                      Tab(text: 'Payroll'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _buildInfoTab(),
                        _buildAttendanceTab(),
                        _buildPayrollTab(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
            const SizedBox(height: 16),
            Text('Staff Name $staffId', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text('Senior Teacher • Science', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue.shade100,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text('Teacher', style: TextStyle(color: Colors.blue)),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(icon: const Icon(Icons.call, color: Colors.green), onPressed: () {}),
                IconButton(icon: const Icon(Icons.email, color: Colors.orange), onPressed: () {}),
                IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => context.go('/staff/add?id=$staffId')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(leading: Icon(Icons.email), title: Text('Email'), subtitle: Text('staff@school.com')),
        ListTile(leading: Icon(Icons.phone), title: Text('Phone'), subtitle: Text('+1 234 567 890')),
        ListTile(leading: Icon(Icons.home), title: Text('Address'), subtitle: Text('123 Main St, City')),
        ListTile(leading: Icon(Icons.calendar_today), title: Text('Joining Date'), subtitle: Text('01 Jan 2020')),
        ListTile(leading: Icon(Icons.school), title: Text('Qualification'), subtitle: Text('M.Sc Mathematics')),
        ListTile(leading: Icon(Icons.bloodtype), title: Text('Blood Group'), subtitle: Text('O+')),
      ],
    );
  }

  Widget _buildAttendanceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Text('Attendance Summary (This Month)', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          // Mock Circular Indicator
          SizedBox(
            width: 150,
            height: 150,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CircularProgressIndicator(value: 0.85, strokeWidth: 10, color: Colors.green),
                Center(child: Text('85%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          const SizedBox(height: 24),
          TableCalendar(
            firstDay: DateTime.utc(2023, 1, 1),
            lastDay: DateTime.utc(2024, 12, 31),
            focusedDay: DateTime.now(),
            calendarFormat: CalendarFormat.month,
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) {
                // Mock logic: Weekends are holidays, random absent
                if (day.weekday == DateTime.sunday) return Center(child: Text(day.day.toString(), style: const TextStyle(color: Colors.blue)));
                if (day.day % 7 == 0) return Container(margin: const EdgeInsets.all(6), decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle), child: Center(child: Text(day.day.toString(), style: const TextStyle(color: Colors.white))));
                return Container(margin: const EdgeInsets.all(6), decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle), child: Center(child: Text(day.day.toString(), style: const TextStyle(color: Colors.white))));
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayrollTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: Colors.green.shade50,
          child: const ListTile(
            title: Text('Current Basic Salary'),
            subtitle: Text('\$3,500'),
            trailing: Icon(Icons.attach_money, color: Colors.green),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Salary History', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...List.generate(5, (index) {
          return Card(
            child: ListTile(
              title: Text('Month: ${DateTime.now().subtract(Duration(days: 30 * index)).toString().substring(0, 7)}'),
              subtitle: Text('Status: ${index == 0 ? "Pending" : "Paid"}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('\$3,500', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  IconButton(icon: const Icon(Icons.download), onPressed: () {}),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;

  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
