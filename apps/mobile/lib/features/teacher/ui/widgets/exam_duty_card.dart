import 'package:flutter/material.dart';

class ExamDutyCard extends StatefulWidget {
  final String teacherId;

  const ExamDutyCard({Key? key, required this.teacherId}) : super(key: key);

  @override
  State<ExamDutyCard> createState() => _ExamDutyCardState();
}

class InvigilationDuty {
  final String roomNo;
  final String time;
  final bool isToday;

  InvigilationDuty({
    required this.roomNo,
    required this.time,
    required this.isToday,
  });
}

class _ExamDutyCardState extends State<ExamDutyCard> {
  InvigilationDuty? _duty;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkDuty();
  }

  Future<void> _checkDuty() async {
    // Mock API
    await Future.delayed(Duration(milliseconds: 500));
    // Simulate fetching duty. If null, no duty.
    setState(() {
      _duty = InvigilationDuty(
        roomNo: '204',
        time: '10:00 AM - 1:00 PM',
        isToday: true,
      );
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return SizedBox.shrink();
    if (_duty == null || !_duty!.isToday) return SizedBox.shrink();

    return Card(
      color: Colors.red.shade50,
      margin: EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.red.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Icon(Icons.assignment_late, color: Colors.red),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Examination Duty Today',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.red.shade900,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Invigilation: Room ${_duty!.roomNo} | ${_duty!.time}',
                    style: TextStyle(color: Colors.red.shade800),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
