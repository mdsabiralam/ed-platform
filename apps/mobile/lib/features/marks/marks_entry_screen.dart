import 'package:flutter/material.dart';
import 'marks_repository.dart';

class MarksEntryScreen extends StatefulWidget {
  final String examId;
  final String subjectId;

  const MarksEntryScreen({super.key, required this.examId, required this.subjectId});

  @override
  State<MarksEntryScreen> createState() => _MarksEntryScreenState();
}

class _MarksEntryScreenState extends State<MarksEntryScreen> {
  final MarksRepository _repository = MarksRepository();
  // Mock Students
  final List<Map<String, dynamic>> _students = [
    {'id': 'student1', 'rollNo': '101', 'name': 'John Doe', 'theory': 0.0, 'practical': 0.0, 'isAbsent': false},
    {'id': 'student2', 'rollNo': '102', 'name': 'Jane Smith', 'theory': 0.0, 'practical': 0.0, 'isAbsent': false},
  ];

  final List<FocusNode> _theoryNodes = [];
  final List<FocusNode> _practicalNodes = [];

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    for (var i = 0; i < _students.length; i++) {
      _theoryNodes.add(FocusNode());
      _practicalNodes.add(FocusNode());
    }
  }

  @override
  void dispose() {
    for (var node in _theoryNodes) node.dispose();
    for (var node in _practicalNodes) node.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final marks = _students.map((s) => {
        'studentId': s['id'],
        'examId': widget.examId,
        'subjectId': widget.subjectId,
        'theory': s['theory'],
        'practical': s['practical'],
        'isAbsent': s['isAbsent'],
      }).toList();

      await _repository.bulkUploadMarks(marks);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved Successfully')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Marks Entry'),
        actions: [
          IconButton(
            icon: _saving ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.save),
            onPressed: _saving ? null : _save,
          )
        ],
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Roll No')),
              DataColumn(label: Text('Name')),
              DataColumn(label: Text('Theory')),
              DataColumn(label: Text('Practical')),
              DataColumn(label: Text('Total')),
              DataColumn(label: Text('Absent')),
            ],
            rows: _students.asMap().entries.map((entry) {
              final index = entry.key;
              final student = entry.value;
              final total = (student['isAbsent'] as bool) ? 0 : ((student['theory'] as num) + (student['practical'] as num));

              return DataRow(cells: [
                DataCell(Text(student['rollNo'])),
                DataCell(Text(student['name'])),
                DataCell(SizedBox(width: 60, child: TextFormField(
                  initialValue: student['theory'].toString(),
                  focusNode: _theoryNodes[index],
                  textInputAction: TextInputAction.next,
                  onFieldSubmitted: (_) {
                    if (index < _students.length - 1) {
                      _theoryNodes[index + 1].requestFocus();
                    } else {
                      _practicalNodes[0].requestFocus();
                    }
                  },
                  keyboardType: TextInputType.number,
                  onChanged: (v) {
                      setState(() {
                        student['theory'] = double.tryParse(v) ?? 0.0;
                      });
                  },
                ))),
                DataCell(SizedBox(width: 60, child: TextFormField(
                  initialValue: student['practical'].toString(),
                  focusNode: _practicalNodes[index],
                  textInputAction: TextInputAction.next,
                  onFieldSubmitted: (_) {
                    if (index < _students.length - 1) {
                      _practicalNodes[index + 1].requestFocus();
                    }
                  },
                  keyboardType: TextInputType.number,
                  onChanged: (v) {
                      setState(() {
                        student['practical'] = double.tryParse(v) ?? 0.0;
                      });
                  },
                ))),
                DataCell(Text(total.toString())),
                DataCell(Checkbox(
                  value: student['isAbsent'],
                  onChanged: (v) {
                      setState(() => student['isAbsent'] = v ?? false);
                  },
                )),
              ]);
            }).toList(),
          ),
        ),
      ),
    );
  }
}
