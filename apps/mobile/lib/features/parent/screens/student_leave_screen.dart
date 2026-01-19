import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

class StudentLeaveScreen extends StatefulWidget {
  const StudentLeaveScreen({super.key});

  @override
  State<StudentLeaveScreen> createState() => _StudentLeaveScreenState();
}

class _StudentLeaveScreenState extends State<StudentLeaveScreen> {
  final _reasonController = TextEditingController();
  DateTimeRange? _dateRange;
  String? _fileName;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Apply Leave'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildForm(),
        const Divider(height: 32),
        const Text('History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 16),
        _buildHistoryList(),
      ],
    );
  }

  Widget _buildWebLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 4,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Card(padding: const EdgeInsets.all(24), child: _buildForm()),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 6,
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('History', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22)),
                const SizedBox(height: 16),
                Expanded(child: _buildHistoryList()),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: () async {
            final picked = await showDateRangePicker(
              context: context,
              firstDate: DateTime.now(),
              lastDate: DateTime(2025),
            );
            if (picked != null) setState(() => _dateRange = picked);
          },
          child: InputDecorator(
            decoration: const InputDecoration(labelText: 'Date Range', border: OutlineInputBorder(), prefixIcon: Icon(Icons.calendar_today)),
            child: Text(
              _dateRange == null
                  ? 'Select Dates'
                  : '${_dateRange!.start.toString().split(' ')[0]} - ${_dateRange!.end.toString().split(' ')[0]}',
            ),
          ),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: 'Sick',
          items: ['Sick', 'Family Event', 'Travel'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          decoration: const InputDecoration(labelText: 'Reason Type', border: OutlineInputBorder()),
          onChanged: (v) {},
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _reasonController,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Detailed Reason', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () async {
            final result = await FilePicker.platform.pickFiles();
            if (result != null) setState(() => _fileName = result.files.single.name);
          },
          icon: const Icon(Icons.attach_file),
          label: Text(_fileName ?? 'Attach Medical Certificate'),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application Submitted')));
          },
          style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
          child: const Text('Submit Application'),
        ),
      ],
    );
  }

  Widget _buildHistoryList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 3,
      itemBuilder: (context, index) {
        final status = index == 0 ? 'Pending' : 'Approved';
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: const Text('Sick Leave'),
            subtitle: const Text('12 Oct - 13 Oct'),
            trailing: Chip(
              label: Text(status),
              backgroundColor: status == 'Approved' ? Colors.green.shade100 : Colors.amber.shade100,
              labelStyle: TextStyle(color: status == 'Approved' ? Colors.green : Colors.amber.shade900),
            ),
          ),
        );
      },
    );
  }
}
