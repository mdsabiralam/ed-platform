import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:typed_data';

class AdmissionFormScreen extends StatefulWidget {
  const AdmissionFormScreen({super.key});

  @override
  State<AdmissionFormScreen> createState() => _AdmissionFormScreenState();
}

class _AdmissionFormScreenState extends State<AdmissionFormScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final _fullNameController = TextEditingController();
  final _fatherNameController = TextEditingController();
  final _motherNameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _prevSchoolController = TextEditingController();

  XFile? _photo;
  Uint8List? _photoBytes;
  DateTime? _dob;
  String _gender = 'Male';
  bool _siblingFound = false;

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

  void _checkSibling(String value) {
    // Mock API call
    if (value.length == 10 && value.endsWith('0')) {
      setState(() => _siblingFound = true);
    } else {
      setState(() => _siblingFound = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Admission Application'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Save Draft', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: Stepper(
        type: StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 3) {
            setState(() => _currentStep += 1);
          } else {
            // Submit
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Application Submitted')));
            context.pop();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        steps: [
          Step(
            title: const Text('Personal'),
            content: _buildPersonalStep(),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: const Text('Guardian'),
            content: _buildGuardianStep(),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: const Text('History'),
            content: _buildHistoryStep(),
            isActive: _currentStep >= 2,
          ),
          Step(
            title: const Text('Docs'),
            content: _buildDocsStep(),
            isActive: _currentStep >= 3,
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalStep() {
    return Column(
      children: [
        GestureDetector(
          onTap: _pickImage,
          child: CircleAvatar(
            radius: 50,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: _photoBytes != null ? MemoryImage(_photoBytes!) : null,
            child: _photoBytes == null ? const Icon(Icons.camera_alt, size: 40) : null,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _fullNameController,
          decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        InkWell(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: DateTime(2015),
              firstDate: DateTime(2000),
              lastDate: DateTime.now(),
            );
            if (picked != null) setState(() => _dob = picked);
          },
          child: InputDecorator(
            decoration: const InputDecoration(labelText: 'Date of Birth', border: OutlineInputBorder()),
            child: Text(_dob?.toString().split(' ')[0] ?? 'Select Date'),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            const Text('Gender: '),
            Radio(value: 'Male', groupValue: _gender, onChanged: (v) => setState(() => _gender = v.toString())),
            const Text('Male'),
            Radio(value: 'Female', groupValue: _gender, onChanged: (v) => setState(() => _gender = v.toString())),
            const Text('Female'),
          ],
        ),
      ],
    );
  }

  Widget _buildGuardianStep() {
    return Column(
      children: [
        TextFormField(
          controller: _mobileController,
          decoration: const InputDecoration(labelText: 'Primary Mobile', border: OutlineInputBorder()),
          onChanged: _checkSibling,
        ),
        const SizedBox(height: 16),
        if (_siblingFound)
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.amber.shade100,
            child: const Row(
              children: [
                Icon(Icons.info, color: Colors.amber),
                SizedBox(width: 8),
                Expanded(child: Text('Parent Found! Linking as Sibling...')),
              ],
            ),
          )
        else ...[
          TextFormField(
            controller: _fatherNameController,
            decoration: const InputDecoration(labelText: 'Father\'s Name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _motherNameController,
            decoration: const InputDecoration(labelText: 'Mother\'s Name', border: OutlineInputBorder()),
          ),
        ],
      ],
    );
  }

  Widget _buildHistoryStep() {
    return Column(
      children: [
        TextFormField(
          controller: _prevSchoolController,
          decoration: const InputDecoration(labelText: 'Previous School Name', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 16),
        TextFormField(
          decoration: const InputDecoration(labelText: 'Last Class Passed', border: OutlineInputBorder()),
        ),
      ],
    );
  }

  Widget _buildDocsStep() {
    return Column(
      children: [
        _buildUploadBox('Birth Certificate'),
        const SizedBox(height: 16),
        _buildUploadBox('Transfer Certificate (TC)'),
        const SizedBox(height: 16),
        _buildUploadBox('Aadhaar/National ID'),
      ],
    );
  }

  Widget _buildUploadBox(String label) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey, style: BorderStyle.solid), // Dotted border logic needed, using solid for now
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          const Icon(Icons.upload_file, size: 40, color: Colors.blue),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const Text('Tap to upload PDF/JPG', style: TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }
}
