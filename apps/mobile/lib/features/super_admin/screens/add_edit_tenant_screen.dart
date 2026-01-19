import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

class AddEditTenantScreen extends StatefulWidget {
  final String? tenantId;
  const AddEditTenantScreen({super.key, this.tenantId});

  @override
  State<AddEditTenantScreen> createState() => _AddEditTenantScreenState();
}

class _AddEditTenantScreenState extends State<AddEditTenantScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _domainController = TextEditingController();
  final TextEditingController _adminEmailController = TextEditingController();
  String _selectedPlan = 'Basic';
  XFile? _logo;
  Uint8List? _logoBytes;

  bool get isEditMode => widget.tenantId != null;

  @override
  void initState() {
    super.initState();
    if (isEditMode) {
      // Mock pre-fill
      _nameController.text = 'School ${widget.tenantId}';
      _domainController.text = 'school${widget.tenantId}';
      _selectedPlan = 'Standard';
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final bytes = await image.readAsBytes();
      setState(() {
        _logo = image;
        _logoBytes = bytes;
      });
    }
  }

  ImageProvider? _getImageProvider() {
    if (_logoBytes != null) {
      return MemoryImage(_logoBytes!);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditMode ? 'Edit School' : 'New School'),
        backgroundColor: const Color(0xFF0D47A1), // Deep Blue
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
           Widget content = SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: GestureDetector(
                      onTap: _pickImage,
                      child: CircleAvatar(
                        radius: 50,
                        backgroundColor: Colors.lightBlue.shade100,
                        backgroundImage: _getImageProvider(),
                        child: _logoBytes == null
                            ? const Icon(Icons.camera_alt, size: 40, color: Colors.blue)
                            : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'School Name',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _domainController,
                    decoration: const InputDecoration(
                      labelText: 'Subdomain',
                      suffixText: '.ed.app',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                       if (value == null || value.isEmpty) return 'Required';
                       if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) return 'Alphanumeric only';
                       return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedPlan,
                    decoration: const InputDecoration(
                      labelText: 'Plan',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Basic', child: Text('Basic')),
                      DropdownMenuItem(value: 'Standard', child: Text('Standard')),
                      DropdownMenuItem(value: 'Enterprise', child: Text('Enterprise')),
                    ],
                    onChanged: (val) => setState(() => _selectedPlan = val!),
                  ),
                  if (!isEditMode) ...[
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _adminEmailController,
                      decoration: const InputDecoration(
                        labelText: 'Admin Email',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
                    ),
                  ],
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Call API logic
                        ScaffoldMessenger.of(context).showSnackBar(
                           const SnackBar(content: Text('Saved Successfully')),
                        );
                        context.pop();
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFF0D47A1),
                      foregroundColor: Colors.white,
                    ),
                    child: Text(isEditMode ? 'Update School' : 'Create School'),
                  ),
                ],
              ),
            ),
          );

          if (constraints.maxWidth > 800) {
            return Center(
              child: Card(
                elevation: 4,
                margin: const EdgeInsets.all(32),
                child: SizedBox(
                  width: 600,
                  child: content,
                ),
              ),
            );
          }
          return content;
        },
      ),
    );
  }
}
