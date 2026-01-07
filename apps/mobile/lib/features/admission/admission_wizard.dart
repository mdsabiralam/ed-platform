import 'package:flutter/material.dart';

// 4.B.09 Multi-step Admission Wizard
class AdmissionWizard extends StatefulWidget {
  final Function(Map<String, dynamic>) onSubmit;

  const AdmissionWizard({Key? key, required this.onSubmit}) : super(key: key);

  @override
  _AdmissionWizardState createState() => _AdmissionWizardState();
}

class _AdmissionWizardState extends State<AdmissionWizard> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // State retention
  // Using snake_case to match Backend DTO structure
  final Map<String, dynamic> _formData = {
    'personal_details': {},
    'guardian_details': {},
    'previous_school_history': [],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Admission')),
      body: Stepper(
        type: StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() {
              _currentStep += 1;
            });
          } else {
             // Review and Submit
             widget.onSubmit(_formData);
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() {
              _currentStep -= 1;
            });
          }
        },
        steps: [
          Step(
            title: const Text('Basic Info'),
            content: _buildBasicInfoStep(),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: const Text('Parents Info'),
            content: _buildParentsInfoStep(),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: const Text('Documents'),
            content: _buildDocumentsStep(),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  Widget _buildBasicInfoStep() {
    return Column(
      children: [
        TextFormField(
          decoration: const InputDecoration(labelText: 'First Name'),
          onChanged: (val) => _formData['personal_details']['first_name'] = val,
        ),
        TextFormField(
          decoration: const InputDecoration(labelText: 'Last Name'),
          onChanged: (val) => _formData['personal_details']['last_name'] = val,
        ),
        TextFormField(
          decoration: const InputDecoration(labelText: 'Date of Birth'),
           onChanged: (val) => _formData['personal_details']['date_of_birth'] = val,
        ),
      ],
    );
  }

  Widget _buildParentsInfoStep() {
    return Column(
      children: [
         TextFormField(
          decoration: const InputDecoration(labelText: 'Father Name'),
          onChanged: (val) => _formData['guardian_details']['father_name'] = val,
        ),
        TextFormField(
          decoration: const InputDecoration(labelText: 'Mother Name'),
          onChanged: (val) => _formData['guardian_details']['mother_name'] = val,
        ),
        TextFormField(
          decoration: const InputDecoration(labelText: 'Primary Mobile'),
          onChanged: (val) => _formData['guardian_details']['primary_mobile'] = val,
        ),
      ],
    );
  }

  Widget _buildDocumentsStep() {
    return Column(
      children: [
        ElevatedButton(
          onPressed: () {
            // Pick file logic
          },
          child: const Text('Upload Birth Certificate')
        ),
        // List uploaded documents here
      ],
    );
  }
}
