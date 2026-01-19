import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AcademicSetupScreen extends StatelessWidget {
  const AcademicSetupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Academic Configuration'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('New Session', style: TextStyle(color: Colors.white)),
            onPressed: () {},
          ),
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
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            labelColor: Colors.indigo,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'Classes & Sections'),
              Tab(text: 'Timetable'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildClassTree(context),
                _buildTimetableList(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 300,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.grey.shade100,
                child: const Text('Structure', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              Expanded(child: _buildClassTree(context)),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Timetable: Class 10 - A', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.auto_awesome),
                      label: const Text('Auto-Generate Routine'),
                      onPressed: () {}, // Mock API
                    ),
                  ],
                ),
              ),
              Expanded(child: _buildTimetableGrid(context)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildClassTree(BuildContext context) {
    return ListView(
      children: [
        _buildExpansionTile(context, 'Session 2023-24', [
          _buildExpansionTile(context, 'Class 10', [
            ListTile(
              title: const Text('Section A'),
              subtitle: const Text('Teacher: Mr. Smith'),
              onTap: () => context.go('/student/list?class=10&section=A'), // Mock route
            ),
            const ListTile(title: Text('Section B')),
          ]),
          const ListTile(title: Text('Class 9')),
        ]),
      ],
    );
  }

  Widget _buildExpansionTile(BuildContext context, String title, List<Widget> children) {
    return ExpansionTile(
      title: Text(title),
      children: children.map((c) => Padding(padding: const EdgeInsets.only(left: 16.0), child: c)).toList(),
    );
  }

  Widget _buildTimetableList(BuildContext context) {
    // Mobile Timetable View
    return ListView.builder(
      itemCount: 6, // Mon-Sat
      itemBuilder: (context, index) {
        final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return ExpansionTile(
          title: Text(days[index]),
          children: List.generate(4, (i) => ListTile(
            leading: Text('09:00 - 10:00', style: const TextStyle(fontSize: 12)),
            title: Text(i % 2 == 0 ? 'Math' : 'Science'),
            subtitle: Text('Room 101'),
          )),
        );
      },
    );
  }

  Widget _buildTimetableGrid(BuildContext context) {
    // Web Timetable Grid
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    final timeSlots = ['09:00', '10:00', '11:00', '12:00', '01:00'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SizedBox(
        width: 800,
        child: Table(
          border: TableBorder.all(color: Colors.grey.shade300),
          children: [
            TableRow(
              decoration: BoxDecoration(color: Colors.grey.shade100),
              children: [
                const TableCell(child: Padding(padding: EdgeInsets.all(8), child: Text('Time/Day'))),
                ...days.map((d) => TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(d, textAlign: TextAlign.center)))),
              ],
            ),
            ...timeSlots.map((time) {
              return TableRow(
                children: [
                  TableCell(child: Padding(padding: const EdgeInsets.all(8), child: Text(time))),
                  ...days.map((d) => TableCell(
                    child: Container(
                      height: 60,
                      margin: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.grey.shade200),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(child: Text(d == 'Sun' ? '' : 'Math\nRoom 101', textAlign: TextAlign.center, style: const TextStyle(fontSize: 12))),
                    ),
                  )),
                ],
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
