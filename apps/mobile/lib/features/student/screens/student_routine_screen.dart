import 'package:flutter/material.dart';

class StudentRoutineScreen extends StatelessWidget {
  const StudentRoutineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Class Routine'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    final today = DateTime.now().weekday; // 1 = Mon, 7 = Sun
    // Auto-select tab logic is handled by DefaultTabController's initialIndex if we map 1-7 to 0-6.
    // Simplifying for mock:

    return DefaultTabController(
      length: 6, // Mon-Sat
      initialIndex: (today - 1).clamp(0, 5),
      child: Column(
        children: [
          const TabBar(
            isScrollable: true,
            labelColor: Colors.teal,
            tabs: [
              Tab(text: 'Mon'), Tab(text: 'Tue'), Tab(text: 'Wed'), Tab(text: 'Thu'), Tab(text: 'Fri'), Tab(text: 'Sat')
            ],
          ),
          Expanded(
            child: TabBarView(
              children: List.generate(6, (dayIndex) {
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: 5,
                  itemBuilder: (context, slotIndex) {
                    final isCurrent = dayIndex == (today - 1) && slotIndex == 1; // Mock 'current' slot logic
                    return Card(
                      color: isCurrent ? Colors.teal.shade50 : null,
                      shape: isCurrent ? RoundedRectangleBorder(side: const BorderSide(color: Colors.teal, width: 2), borderRadius: BorderRadius.circular(12)) : null,
                      child: ListTile(
                        leading: Text('${9 + slotIndex}:00', style: const TextStyle(fontWeight: FontWeight.bold)),
                        title: Text(slotIndex == 2 ? 'Break' : 'Subject ${slotIndex + 1}'),
                        subtitle: slotIndex == 2 ? null : const Text('Room 101 • Mr. Teacher'),
                        trailing: isCurrent ? const Chip(label: Text('Now'), backgroundColor: Colors.teal, labelStyle: TextStyle(color: Colors.white, fontSize: 10)) : null,
                      ),
                    );
                  },
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWebLayout() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Table(
        border: TableBorder.all(color: Colors.grey.shade300),
        children: [
          TableRow(
            decoration: BoxDecoration(color: Colors.teal.shade50),
            children: const [
              Padding(padding: EdgeInsets.all(16), child: Text('Time/Day', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(16), child: Text('Mon', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(16), child: Text('Tue', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(16), child: Text('Wed', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(16), child: Text('Thu', style: TextStyle(fontWeight: FontWeight.bold))),
              Padding(padding: EdgeInsets.all(16), child: Text('Fri', style: TextStyle(fontWeight: FontWeight.bold))),
            ],
          ),
          ...List.generate(5, (timeIndex) {
            return TableRow(
              children: [
                Padding(padding: const EdgeInsets.all(16), child: Text('${9 + timeIndex}:00')),
                ...List.generate(5, (dayIndex) {
                   final isCurrent = dayIndex == (DateTime.now().weekday - 1) && timeIndex == 1;
                   return Container(
                     padding: const EdgeInsets.all(16),
                     color: isCurrent ? Colors.teal.shade100 : null,
                     child: Text(timeIndex == 2 ? 'Break' : 'Math\nRoom 101'),
                   );
                }),
              ],
            );
          }),
        ],
      ),
    );
  }
}
