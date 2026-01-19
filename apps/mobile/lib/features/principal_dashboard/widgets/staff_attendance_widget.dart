import 'package:flutter/material.dart';

class StaffAttendanceWidget extends StatefulWidget {
  const StaffAttendanceWidget({super.key});

  @override
  State<StaffAttendanceWidget> createState() => _StaffAttendanceWidgetState();
}

class _StaffAttendanceWidgetState extends State<StaffAttendanceWidget> {
  // Simulating staff status
  final Map<String, bool> _staffStatus = {
    'Mr. Anderson (Physics)': true, // Present
    'Mrs. Smith (Math)': false, // Absent
    'Ms. Johnson (History)': true, // Present
  };

  String? _substitutionAssignedTo;

  void _assignSubstitution(BuildContext context, String absentTeacher) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Assign Substitution"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Select a substitute teacher:"),
            const SizedBox(height: 10),
            DropdownButton<String>(
              value: _substitutionAssignedTo,
              hint: const Text("Choose Teacher"),
              isExpanded: true,
              items: ['Mr. Anderson', 'Ms. Johnson', 'Mr. White (Reserve)']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (val) {
                setState(() {
                  _substitutionAssignedTo = val;
                });
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Substitution Assigned to $val")),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.people, color: Colors.orange),
                const SizedBox(width: 8),
                Text(
                  "Staff Oversight",
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const Divider(),
            ..._staffStatus.entries.map((entry) {
              final isPresent = entry.value;
              final isSubstituted = !isPresent && _substitutionAssignedTo != null;

              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: isPresent ? Colors.green : Colors.red,
                  radius: 10,
                ),
                title: Text(entry.key),
                subtitle: isPresent
                    ? const Text("Present")
                    : Text(isSubstituted ? "Substitute: $_substitutionAssignedTo" : "Absent - Action Required!", style: TextStyle(color: Colors.red)),
                trailing: !isPresent && !isSubstituted
                    ? OutlinedButton(
                        onPressed: () => _assignSubstitution(context, entry.key),
                        child: const Text("Assign Sub"),
                      )
                    : null,
              );
            }),
          ],
        ),
      ),
    );
  }
}
