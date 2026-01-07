import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class Student {
  final String id;
  final String name;
  final String rollNo;
  final String fatherName;
  final String parentPhone;

  Student({
    required this.id,
    required this.name,
    required this.rollNo,
    required this.fatherName,
    required this.parentPhone,
  });
}

class StudentList extends StatefulWidget {
  final String classId;

  const StudentList({Key? key, required this.classId}) : super(key: key);

  @override
  State<StudentList> createState() => _StudentListState();
}

class _StudentListState extends State<StudentList> {
  List<Student> _students = [];

  @override
  void initState() {
    super.initState();
    // Dummy Data
    _students = List.generate(
      20,
      (index) => Student(
        id: '$index',
        name: 'Student Name $index',
        rollNo: '${index + 1}',
        fatherName: 'Father Name $index',
        parentPhone: '1234567890',
      ),
    );
  }

  Future<void> _callParent(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not launch dialer')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: _students.length,
      itemBuilder: (context, index) {
        final student = _students[index];
        return Card(
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ListTile(
            leading: CircleAvatar(
              child: Text(student.rollNo),
              backgroundColor: Colors.blue.shade100,
            ),
            title: Text(student.name, style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Father: ${student.fatherName}'),
            trailing: IconButton(
              icon: Icon(Icons.call, color: Colors.green),
              onPressed: () => _callParent(student.parentPhone),
            ),
          ),
        );
      },
    );
  }
}
