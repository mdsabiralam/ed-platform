import 'package:flutter/material.dart';

class TimetableWidget extends StatelessWidget {
  final bool isTeacher; // Or derive from context/role

  const TimetableWidget({super.key, this.isTeacher = false});

  @override
  Widget build(BuildContext context) {
    // Determine current slot based on time
    // For demo, assume current time is 10:00 AM -> 2nd Period
    const currentPeriodIndex = 1;

    return Scaffold(
      appBar: AppBar(title: const Text('Timetable')),
      body: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: 5, // Mon-Fri
        itemBuilder: (context, dayIndex) {
           return Card(
             margin: const EdgeInsets.only(bottom: 16),
             child: ExpansionTile(
               title: Text(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][dayIndex]),
               initiallyExpanded: dayIndex == 0, // Today
               children: List.generate(6, (slotIndex) {
                 final isCurrent = dayIndex == 0 && slotIndex == currentPeriodIndex;
                 return Container(
                   color: isCurrent ? Colors.yellow.withOpacity(0.3) : null,
                   child: ListTile(
                     leading: Text('${9 + slotIndex}:00'),
                     title: Text('Subject ${slotIndex + 1}'),
                     subtitle: Text('Room 10${slotIndex + 1}'),
                     trailing: isTeacher ? const Icon(Icons.arrow_forward_ios, size: 16) : null,
                     onTap: isTeacher ? () {
                       // Navigate to LessonPlan
                       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Navigating to Lesson Plan...')));
                     } : null,
                   ),
                 );
               }),
             ),
           );
        },
      ),
    );
  }
}
