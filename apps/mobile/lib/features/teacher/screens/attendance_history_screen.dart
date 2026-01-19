import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  final CalendarFormat _calendarFormat = CalendarFormat.week;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance Log'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.picture_as_pdf), onPressed: () {}), // Export Mock
        ],
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
    return Column(
      children: [
        TableCalendar(
          firstDay: DateTime.utc(2023, 1, 1),
          lastDay: DateTime.utc(2025, 12, 31),
          focusedDay: _focusedDay,
          calendarFormat: _calendarFormat,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (selectedDay, focusedDay) {
            setState(() {
              _selectedDay = selectedDay;
              _focusedDay = focusedDay;
            });
          },
        ),
        const SizedBox(height: 16),
        _buildSummaryCard(),
        const Expanded(child: _AttendanceList()),
      ],
    );
  }

  Widget _buildWebLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 350,
          child: Column(
            children: [
              TableCalendar(
                firstDay: DateTime.utc(2023, 1, 1),
                lastDay: DateTime.utc(2025, 12, 31),
                focusedDay: _focusedDay,
                calendarFormat: CalendarFormat.month,
                selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                onDaySelected: (selectedDay, focusedDay) {
                  setState(() {
                    _selectedDay = selectedDay;
                    _focusedDay = focusedDay;
                  });
                },
              ),
              const SizedBox(height: 24),
              _buildSummaryCard(),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        const Expanded(child: _AttendanceTable()),
      ],
    );
  }

  Widget _buildSummaryCard() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStat('Total', '50', Colors.blue),
            _buildStat('Present', '45', Colors.green),
            _buildStat('Absent', '5', Colors.red),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}

class _AttendanceList extends StatelessWidget {
  const _AttendanceList();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) {
        final status = index < 8 ? 'Present' : 'Absent';
        return ListTile(
          leading: CircleAvatar(child: Text('${index + 1}')),
          title: Text('Student Name ${index + 1}'),
          trailing: Chip(
            label: Text(status),
            backgroundColor: status == 'Present' ? Colors.green.shade100 : Colors.red.shade100,
            labelStyle: TextStyle(color: status == 'Present' ? Colors.green : Colors.red),
          ),
        );
      },
    );
  }
}

class _AttendanceTable extends StatelessWidget {
  const _AttendanceTable();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const Text('Detailed Report', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        DataTable(
          columns: const [
            DataColumn(label: Text('Roll')),
            DataColumn(label: Text('Name')),
            DataColumn(label: Text('Status')),
            DataColumn(label: Text('Time')),
            DataColumn(label: Text('Sync Status')),
          ],
          rows: List.generate(10, (index) {
            final status = index < 8 ? 'Present' : 'Absent';
            return DataRow(
              cells: [
                DataCell(Text('${index + 1}')),
                DataCell(Text('Student Name ${index + 1}')),
                DataCell(
                   Container(
                     padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                     decoration: BoxDecoration(
                       color: status == 'Present' ? Colors.green : Colors.red,
                       borderRadius: BorderRadius.circular(12),
                     ),
                     child: Text(status, style: const TextStyle(color: Colors.white)),
                   ),
                ),
                const DataCell(Text('09:05 AM')),
                const DataCell(Icon(Icons.cloud_done, color: Colors.blue)),
              ],
            );
          }),
        ),
      ],
    );
  }
}
