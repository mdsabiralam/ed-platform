import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class TeacherTimetable extends StatefulWidget {
  final String teacherId;

  const TeacherTimetable({Key? key, required this.teacherId}) : super(key: key);

  @override
  State<TeacherTimetable> createState() => _TeacherTimetableState();
}

class TimetableEntry {
  final String subject;
  final String className;
  final DateTime startTime;
  final DateTime endTime;
  final String room;

  TimetableEntry({
    required this.subject,
    required this.className,
    required this.startTime,
    required this.endTime,
    required this.room,
  });
}

class _TeacherTimetableState extends State<TeacherTimetable> {
  List<TimetableEntry> _entries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTimetable();
  }

  Future<void> _fetchTimetable() async {
    // Mock API call
    await Future.delayed(Duration(milliseconds: 500));
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    // Generating dummy schedule for today
    setState(() {
      _entries = [
        TimetableEntry(
          subject: 'Math',
          className: '10-A',
          startTime: today.add(Duration(hours: 9)),
          endTime: today.add(Duration(hours: 9, minutes: 45)),
          room: '101',
        ),
        TimetableEntry(
          subject: 'Physics',
          className: '12-B',
          startTime: today.add(Duration(hours: 10)),
          endTime: today.add(Duration(hours: 10, minutes: 45)),
          room: 'LAB-2',
        ),
        TimetableEntry(
          subject: 'Free Period',
          className: '-',
          startTime: today.add(Duration(hours: 11)),
          endTime: today.add(Duration(hours: 11, minutes: 45)),
          room: 'Staff Room',
        ),
         TimetableEntry(
          subject: 'Math',
          className: '9-C',
          startTime: today.add(Duration(hours: 12)),
          endTime: today.add(Duration(hours: 12, minutes: 45)),
          room: '103',
        ),
      ];
      _isLoading = false;
    });
  }

  bool _isCurrent(TimetableEntry entry) {
    final now = DateTime.now();
    return now.isAfter(entry.startTime) && now.isBefore(entry.endTime);
  }

  bool _isNext(TimetableEntry entry) {
    final now = DateTime.now();
    // Assuming entries are sorted, first one after now is "Next"
    // But for this simple check, let's just say it starts after now
    // and is the closest one.
    // In a real list iteration we can determine this better.
    // Here we will do a simpler check if it's within next hour and not started yet.
    return now.isBefore(entry.startTime) &&
           entry.startTime.difference(now).inMinutes < 60 &&
           entry.startTime.difference(now).inMinutes >= 0;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator());

    // Sort entries just in case
    _entries.sort((a, b) => a.startTime.compareTo(b.startTime));

    // Find next index
    final now = DateTime.now();
    int nextIndex = _entries.indexWhere((e) => e.startTime.isAfter(now));

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: _entries.length,
      itemBuilder: (context, index) {
        final entry = _entries[index];
        final isCurrent = _isCurrent(entry);
        final isNext = index == nextIndex;
        final dateFormat = DateFormat('h:mm a');

        return Card(
          elevation: isCurrent ? 4 : 1,
          margin: EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: isCurrent
              ? BorderSide(color: Colors.blue, width: 2)
              : BorderSide.none,
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dateFormat.format(entry.startTime),
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      dateFormat.format(entry.endTime),
                      style: TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
                VerticalDivider(width: 32, thickness: 1),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            entry.subject,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                          if (isNext)
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.orange.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'NEXT UP',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.deepOrange,
                                  fontWeight: FontWeight.bold
                                ),
                              ),
                            ),
                           if (isCurrent)
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'NOW',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.blue.shade800,
                                  fontWeight: FontWeight.bold
                                ),
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text('Class: ${entry.className} • Room: ${entry.room}'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
