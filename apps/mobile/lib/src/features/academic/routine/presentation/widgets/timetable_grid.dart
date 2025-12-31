import 'package:flutter/material.dart';
import '../../data/models/routine_entry.dart';

class TimetableGrid extends StatelessWidget {
  final List<RoutineEntry> routineEntries;

  const TimetableGrid({super.key, required this.routineEntries});

  @override
  Widget build(BuildContext context) {
    // These should be fetched dynamically in a real app
    final days = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    final timeSlots = [
      '09:00 - 09:45',
      '09:45 - 10:30',
      '10:30 - 11:15',
      '11:15 - 12:00',
      '12:00 - 01:00', // Lunch
      '01:00 - 01:45',
      '01:45 - 02:30',
    ];

    // Create a map for quick lookup
    final routineMap = <String, RoutineEntry>{};
    for (var entry in routineEntries) {
      final key = '${entry.dayOfWeek}_${entry.startTime} - ${entry.endTime}';
      routineMap[key] = entry;
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columnSpacing: 10,
        border: TableBorder.all(color: Colors.grey.shade400),
        columns: [
          const DataColumn(
            label: Text('Time', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          ...days.map(
            (day) => DataColumn(
              label: Text(
                day.substring(0, 3),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
        rows: timeSlots.map((slot) {
          return DataRow(
            cells: [
              // Time slot header cell
              DataCell(
                Center(child: Text(slot, style: const TextStyle(fontSize: 12))),
              ),
              // Routine entry cells for each day
              ...days.map((day) {
                final key = '${day}_$slot';
                final entry = routineMap[key];
                if (entry != null) {
                  return DataCell(
                    _buildCell(
                      subjectCode: entry.subjectCode,
                      roomName: entry.roomName,
                      isPractical: entry.subjectType == 'PRACTICAL',
                    ),
                  );
                } else {
                  // Empty cell
                  return const DataCell(SizedBox.shrink());
                }
              }),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCell({
    required String subjectCode,
    required String roomName,
    bool isPractical = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isPractical ? Colors.blue.shade50 : Colors.green.shade50,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              subjectCode,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              roomName,
              style: const TextStyle(fontSize: 11, color: Colors.black54),
            ),
          ],
        ),
      ),
    );
  }
}
