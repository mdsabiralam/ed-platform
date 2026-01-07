import 'package:flutter/material.dart';
import 'package:mobile/core/database/app_database.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift; // Alias to avoid conflict with Value
import 'dart:convert'; // Import added

class SmartAttendanceScreen extends StatefulWidget {
  const SmartAttendanceScreen({super.key});

  @override
  State<SmartAttendanceScreen> createState() => _SmartAttendanceScreenState();
}

class _SmartAttendanceScreenState extends State<SmartAttendanceScreen> {
  // Map student ID to status (true = Present, false = Absent)
  final Map<int, bool> _attendance = {};

  @override
  Widget build(BuildContext context) {
    // Assuming AppDatabase is provided via Provider/RepositoryProvider
    final db = Provider.of<AppDatabase>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Smart Attendance')),
      body: StreamBuilder<List<Student>>(
        stream: db.select(db.students).watch(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
             return const Center(child: CircularProgressIndicator());
          }
          final students = snapshot.data!;

          return Column(
            children: [
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(8),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.8,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                  ),
                  itemCount: students.length,
                  itemBuilder: (context, index) {
                    final student = students[index];
                    final isPresent = _attendance[student.id] ?? true;

                    return InkWell(
                      onTap: () {
                        setState(() {
                          _attendance[student.id] = !isPresent;
                        });
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: isPresent ? Colors.green[100] : Colors.red[100],
                          border: Border.all(
                            color: isPresent ? Colors.green : Colors.red,
                            width: 2,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircleAvatar(child: Icon(Icons.person)),
                            const SizedBox(height: 8),
                            Text(student.name, textAlign: TextAlign.center),
                            Text(student.rollNo, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text(isPresent ? 'Present' : 'Absent',
                                 style: TextStyle(color: isPresent ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _submitAttendance(db, students),
                    child: const Text('Submit Attendance'),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _submitAttendance(AppDatabase db, List<Student> students) async {
    // 4. Push changes to sync_queue table
    final attendanceData = students.map((s) => {
      'studentId': s.id,
      'status': (_attendance[s.id] ?? true) ? 'PRESENT' : 'ABSENT',
    }).toList();

    // Insert into SyncQueue
    await db.into(db.syncQueue).insert(
      SyncQueueCompanion.insert(
        action: 'SUBMIT_ATTENDANCE',
        payload: jsonEncode(attendanceData), // Fixed JSON serialization
        createdAt: drift.Value(DateTime.now()),
      ),
    );

    if (mounted) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance Submitted (Sync Queued)')));
       Navigator.pop(context);
    }
  }
}
