import 'package:flutter/material.dart';
import '../core/api_client.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  final ApiClient _api = ApiClient();
  List<dynamic> _routine = [];
  bool _isLoading = false;

  // Data definitions for request and lookup
  final List<Map<String, dynamic>> _teachers = [
    {"id": "t1", "name": "Mr. Rahim"},
    {"id": "t2", "name": "Ms. Fatema"},
  ];
  final List<Map<String, dynamic>> _classSections = [
    {"id": "c10-a", "name": "Class 10 - Section A"},
  ];
  final List<Map<String, dynamic>> _subjects = [
    {"id": "sub-math", "name": "Mathematics"},
    {"id": "sub-eng", "name": "English"},
  ];
  final List<Map<String, dynamic>> _rooms = [
    {"id": "r101", "capacity": 40},
  ];
  final List<Map<String, dynamic>> _timeSlots = [
    {"id": "slot1", "day": "Monday", "time": "09:00-10:00"},
    {"id": "slot2", "day": "Monday", "time": "10:00-11:00"},
  ];

  Future<void> _fetchRoutine() async {
    setState(() => _isLoading = true);

    // ১. ডিবাগ লগ: রিকোয়েস্ট শুরু
    print(
      'APP LOG: Request started to ${ApiClient.baseUrl}academic/routine/generate',
    );

    try {
      final response = await _api.post(
        'academic/routine/generate',
        data: {
          "teachers": _teachers,
          "classSections": _classSections,
          "subjects": _subjects,
          "rooms": _rooms,
          "timeSlots": _timeSlots,
          "constraints": {"maxPeriodsPerTeacher": 5, "noDoubleBooking": true},
        },
      );

      // ২. ডিবাগ লগ: রেসপন্স এসেছে
      print('APP LOG: Response received. Status: ${response.statusCode}');
      print('APP LOG: Data: ${response.data}');

      if (response.data['success'] == true || response.statusCode == 201) {
        setState(() => _routine = response.data['data']);
      } else {
        // সার্ভার এরর হ্যান্ডলিং (যেমন 500 বা 400)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Server Error: ${response.statusCode}\n${response.data}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // ৩. ডিবাগ লগ: এরর ধরা পড়েছে
      print('APP LOG: Error occurred: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Timetable Generator')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: _isLoading ? null : _fetchRoutine,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Generate Routine'),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _routine.length,
              itemBuilder: (context, index) {
                final item = _routine[index];

                // Resolve IDs to Objects with fallback for keys
                final subjectId = item['subjectId'] ?? item['subject_id'];
                final teacherId = item['teacherId'] ?? item['teacher_id'];
                final roomId = item['roomId'] ?? item['room_id'];
                final timeslotId =
                    item['timeslotId'] ??
                    item['timeSlotId'] ??
                    item['time_slot_id'];

                final subject = _subjects.firstWhere(
                  (s) => s['id'] == subjectId,
                  orElse: () => {'name': 'Unknown Subject'},
                );
                final teacher = _teachers.firstWhere(
                  (t) => t['id'] == teacherId,
                  orElse: () => {'name': 'Unknown Teacher'},
                );
                final room = _rooms.firstWhere(
                  (r) => r['id'] == roomId,
                  orElse: () => {'id': 'Unknown Room'},
                );
                final timeSlot = _timeSlots.firstWhere(
                  (t) => t['id'] == timeslotId,
                  orElse: () => {'time': 'Unknown Time', 'day': 'Unknown Day'},
                );

                return Card(
                  elevation: 4,
                  margin: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ১. সাবজেক্ট এবং টিচার (সঠিক Key ব্যবহার করা হয়েছে)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${subject['name']}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Chip(
                              label: Text(
                                '${teacher['name']}',
                              ), // teacher -> teacherId
                              backgroundColor: Colors.blue.shade100,
                            ),
                          ],
                        ),
                        const Divider(),
                        // ২. বার, সময় (Slot ID) এবং রুম
                        Row(
                          children: [
                            const Icon(
                              Icons.calendar_today,
                              size: 16,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 5),
                            Text('${timeSlot['day']}'),
                            const Spacer(),
                            const Icon(
                              Icons.access_time,
                              size: 16,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 5),
                            Text('Time: ${timeSlot['time']}'),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            const Icon(
                              Icons.meeting_room,
                              size: 16,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 5),
                            Text('Room: ${room['id']}'), // room -> roomId
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
