import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:typed_data';

class CreateHomeworkScreen extends StatefulWidget {
  const CreateHomeworkScreen({super.key});

  @override
  State<CreateHomeworkScreen> createState() => _CreateHomeworkScreenState();
}

class _CreateHomeworkScreenState extends State<CreateHomeworkScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  DateTime? _dueDate;
  final List<String> _attachments = []; // Storing names for mock

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null) {
      setState(() {
        _attachments.add(result.files.single.name);
      });
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        _attachments.add(image.name);
      });
    }
  }

  void _submit() {
    if (_formKey.currentState!.validate() && _dueDate != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Sent to 40 students!')));
      context.pop();
    } else if (_dueDate == null) {
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a due date')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Assignment'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.send), onPressed: _submit),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return Center(
              child: SizedBox(
                width: 600,
                child: Card(
                  margin: const EdgeInsets.all(32),
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: _buildForm(),
                  ),
                ),
              ),
            );
          }
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: _buildForm(),
          );
        },
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: 'Class 10',
                  items: ['Class 10', 'Class 9'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                  onChanged: (v) {},
                  decoration: const InputDecoration(labelText: 'Class', border: OutlineInputBorder()),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: 'Math',
                  items: ['Math', 'Science'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                  onChanged: (v) {},
                  decoration: const InputDecoration(labelText: 'Subject', border: OutlineInputBorder()),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
            validator: (v) => v!.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _descController,
            maxLines: 5,
            decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: () async {
              final date = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2025));
              if (date != null) setState(() => _dueDate = date);
            },
            child: InputDecorator(
              decoration: const InputDecoration(labelText: 'Due Date', border: OutlineInputBorder()),
              child: Text(_dueDate?.toString().split(' ')[0] ?? 'Select Date'),
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
             initialValue: '100',
             keyboardType: TextInputType.number,
             decoration: const InputDecoration(labelText: 'Max Marks', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 24),
          const Text('Attachments', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey, style: BorderStyle.solid), // Dotted line library not added, using solid
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(icon: const Icon(Icons.camera_alt, size: 32, color: Colors.teal), onPressed: _pickImage),
                    IconButton(icon: const Icon(Icons.attach_file, size: 32, color: Colors.teal), onPressed: _pickFile),
                  ],
                ),
                if (_attachments.isNotEmpty) ...[
                  const Divider(),
                  ..._attachments.map((e) => ListTile(title: Text(e), trailing: const Icon(Icons.close), dense: true)),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }
}
