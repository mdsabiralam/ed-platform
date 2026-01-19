import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import 'dart:typed_data';

class AddStaffScreen extends StatefulWidget {
  const AddStaffScreen({super.key});

  @override
  State<AddStaffScreen> createState() => _AddStaffScreenState();
}

class _AddStaffScreenState extends State<AddStaffScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controllers
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _designationController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _selectedRole = 'Teacher';
  String _selectedDept = 'Science';
  DateTime? _joiningDate;
  XFile? _photo;
  Uint8List? _photoBytes;

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      final bytes = await image.readAsBytes();
      setState(() {
        _photo = image;
        _photoBytes = bytes;
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != _joiningDate) {
      setState(() {
        _joiningDate = picked;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      // Simulate API Call
      await Future.delayed(const Duration(seconds: 2));
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Staff Created Successfully')),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Staff Registration'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          if (!_isLoading)
            TextButton(
              onPressed: _submitForm,
              child: const Text('Save', style: TextStyle(color: Colors.white)),
            )
          else
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              ),
            ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            _buildPersonalSection(),
            const SizedBox(height: 24),
            _buildOfficialSection(),
            const SizedBox(height: 24),
            _buildLoginSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Form(
        key: _formKey,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: _buildPersonalSection()),
            const SizedBox(width: 32),
            Expanded(
              child: Column(
                children: [
                  _buildOfficialSection(),
                  const SizedBox(height: 32),
                  _buildLoginSection(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueGrey),
      ),
    );
  }

  Widget _buildPersonalSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Personal Details'),
        Center(
          child: GestureDetector(
            onTap: _pickImage,
            child: CircleAvatar(
              radius: 50,
              backgroundColor: Colors.grey.shade200,
              backgroundImage: _photoBytes != null ? MemoryImage(_photoBytes!) : null,
              child: _photoBytes == null ? const Icon(Icons.camera_alt, size: 40) : null,
            ),
          ),
        ),
        const SizedBox(height: 24),
        TextFormField(
          controller: _firstNameController,
          decoration: const InputDecoration(labelText: 'First Name', border: OutlineInputBorder()),
          validator: (val) => val!.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _lastNameController,
          decoration: const InputDecoration(labelText: 'Last Name', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _phoneController,
          decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder()),
          validator: (val) => val!.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _addressController,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()),
        ),
      ],
    );
  }

  Widget _buildOfficialSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Official Details'),
        DropdownButtonFormField<String>(
          value: _selectedRole,
          decoration: const InputDecoration(labelText: 'Role', border: OutlineInputBorder()),
          items: ['Teacher', 'Accountant', 'Driver', 'Librarian', 'Clerk']
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: (val) => setState(() => _selectedRole = val!),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedDept,
          decoration: const InputDecoration(labelText: 'Department', border: OutlineInputBorder()),
          items: ['Science', 'Arts', 'Commerce', 'Admin', 'Transport']
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: (val) => setState(() => _selectedDept = val!),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _designationController,
          decoration: const InputDecoration(labelText: 'Designation', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        InkWell(
          onTap: () => _selectDate(context),
          child: InputDecorator(
            decoration: const InputDecoration(labelText: 'Joining Date', border: OutlineInputBorder()),
            child: Text(
              _joiningDate == null ? 'Select Date' : _joiningDate.toString().split(' ')[0],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoginSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Login Details'),
        TextFormField(
          controller: _emailController,
          decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
          validator: (val) => val!.isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _passwordController,
          decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
          obscureText: true,
          validator: (val) => val!.isEmpty ? 'Required' : null,
        ),
      ],
    );
  }
}
