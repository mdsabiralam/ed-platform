import 'package:flutter/material.dart';

class MarksEntryScreen extends StatefulWidget {
  const MarksEntryScreen({super.key});

  @override
  State<MarksEntryScreen> createState() => _MarksEntryScreenState();
}

class _MarksEntryScreenState extends State<MarksEntryScreen> {
  final int maxMarks = 100;
  final List<TextEditingController> _controllers = List.generate(
    50,
    (index) => TextEditingController(),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bulk Marks Entry')),
      body: SingleChildScrollView(
        child: PaginatedDataTable(
          header: const Text('Student Marks'),
          columns: const [
            DataColumn(label: Text('Roll No')),
            DataColumn(label: Text('Name')),
            DataColumn(label: Text('Marks')),
          ],
          source: _DataSource(context, _controllers, maxMarks),
          rowsPerPage: 10,
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _saveMarks,
        child: const Icon(Icons.save),
      ),
    );
  }

  void _saveMarks() {
    // Validate
    bool hasError = false;
    for (var controller in _controllers) {
      if (controller.text.isNotEmpty) {
        final val = double.tryParse(controller.text);
        if (val == null || val > maxMarks) {
          hasError = true;
          break;
        }
      }
    }

    if (hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Validation Error: Marks cannot exceed 100'),
          backgroundColor: Colors.red,
        ),
      );
    } else {
      // Proceed to save
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Marks Saved Successfully')),
      );
    }
  }
}

class _DataSource extends DataTableSource {
  final BuildContext context;
  final List<TextEditingController> controllers;
  final int maxMarks;

  _DataSource(this.context, this.controllers, this.maxMarks);

  @override
  DataRow? getRow(int index) {
    if (index >= controllers.length) return null;
    return DataRow(cells: [
      DataCell(Text('${index + 1}')),
      DataCell(Text('Student ${index + 1}')),
      DataCell(
        TextFormField(
          controller: controllers[index],
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          autovalidateMode: AutovalidateMode.onUserInteraction,
          validator: (value) {
             if (value != null && value.isNotEmpty) {
               final v = double.tryParse(value);
               if (v != null && v > maxMarks) {
                 return 'Max $maxMarks';
               }
             }
             return null;
          },
        ),
      ),
    ]);
  }

  @override
  bool get isRowCountApproximate => false;
  @override
  int get rowCount => controllers.length;
  @override
  int get selectedRowCount => 0;
}
