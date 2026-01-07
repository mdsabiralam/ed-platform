import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class LeaveRequestForm extends StatefulWidget {
  const LeaveRequestForm({Key? key}) : super(key: key);

  @override
  State<LeaveRequestForm> createState() => _LeaveRequestFormState();
}

class _LeaveRequestFormState extends State<LeaveRequestForm> {
  final _formKey = GlobalKey<FormState>();
  String? _leaveType;
  DateTimeRange? _selectedDateRange;
  final TextEditingController _reasonController = TextEditingController();

  final List<String> _leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave'];

  Future<void> _pickDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
      });
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate() && _selectedDateRange != null) {
      // API call
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Leave Request Submitted to Principal')),
      );
    } else if (_selectedDateRange == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a date range')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Apply for Leave',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _leaveType,
                decoration: InputDecoration(
                  labelText: 'Leave Type',
                  border: OutlineInputBorder(),
                ),
                items: _leaveTypes.map((type) {
                  return DropdownMenuItem(value: type, child: Text(type));
                }).toList(),
                onChanged: (val) => setState(() => _leaveType = val),
                validator: (val) => val == null ? 'Required' : null,
              ),
              SizedBox(height: 16),
              InkWell(
                onTap: _pickDateRange,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: 'Duration',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.date_range),
                  ),
                  child: Text(
                    _selectedDateRange == null
                        ? 'Select Dates'
                        : '${DateFormat('dd/MM/yyyy').format(_selectedDateRange!.start)} - ${DateFormat('dd/MM/yyyy').format(_selectedDateRange!.end)}',
                  ),
                ),
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _reasonController,
                decoration: InputDecoration(
                  labelText: 'Reason',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (val) => val!.isEmpty ? 'Required' : null,
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submit,
                child: Text('Submit Application'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
