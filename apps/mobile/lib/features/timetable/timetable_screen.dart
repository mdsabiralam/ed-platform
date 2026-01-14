import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
// import '../../core/api_client.dart'; // Unused until full API integration

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  // final ApiClient _apiClient = ApiClient(); // Mocking data for now
  bool _isLoading = true;
  List<dynamic> _routineEntries = [];
  List<dynamic> _substitutions = [];
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchDailyRoutine();
  }

  Future<void> _fetchDailyRoutine() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      // Mocking fetch delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Mock Routine Data
      // In a real application, this would come from GET /academic/routine/daily
      _routineEntries = [
        {
          'id': 'entry-1',
          'slot': {'startTime': '09:00', 'endTime': '09:45'},
          'subject': {'name': 'Mathematics'},
          'originalTeacher': {'id': 'teacher-1', 'user': {'firstName': 'John', 'lastName': 'Doe'}},
          'room': {'name': '101'}
        },
        {
          'id': 'entry-2',
          'slot': {'startTime': '10:00', 'endTime': '10:45'},
          'subject': {'name': 'Physics'},
          'originalTeacher': {'id': 'teacher-2', 'user': {'firstName': 'Jane', 'lastName': 'Smith'}},
          'room': {'name': '102'}
        }
      ];

      // Mock Substitution Data
      // In a real application, this would come from fetching substitutions for the user/class
      _substitutions = [
        {
          'routineEntryId': 'entry-1',
          'substituteTeacher': {'user': {'firstName': 'Alice', 'lastName': 'Wonder'}},
          'status': 'ASSIGNED'
        }
      ];

      setState(() {
        _isLoading = false;
      });

    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load timetable';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Timetable')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _routineEntries.length,
                  itemBuilder: (context, index) {
                    final entry = _routineEntries[index];
                    return _buildTimetableCard(entry);
                  },
                ),
    );
  }

  Widget _buildTimetableCard(dynamic entry) {
    // Step 6 Logic: Check if substitution exists
    final substitution = _substitutions.firstWhere(
      (sub) => sub['routineEntryId'] == entry['id'] && sub['status'] == 'ASSIGNED',
      orElse: () => null,
    );

    final isSubstituted = substitution != null;

    // Step 6: Change color to light orange if substituted
    final cardColor = isSubstituted ? Colors.orange.shade100 : Colors.white;

    // Step 6: Display Teacher Name
    final originalTeacherName = "${entry['originalTeacher']['user']['firstName']} ${entry['originalTeacher']['user']['lastName']}";
    final displayTeacherName = isSubstituted
        ? "Sub: ${substitution['substituteTeacher']['user']['firstName']} ${substitution['substituteTeacher']['user']['lastName']}"
        : originalTeacherName;

    return Card(
      color: cardColor,
      margin: const EdgeInsets.only(bottom: 16.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "${entry['slot']['startTime']} - ${entry['slot']['endTime']}",
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                // Step 6: Add small label "Substitution"
                if (isSubstituted)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Substitution',
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              entry['subject']['name'],
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(displayTeacherName),
            const SizedBox(height: 4),
            Text("Room: ${entry['room']['name']}"),
          ],
        ),
      ),
    );
  }
}
