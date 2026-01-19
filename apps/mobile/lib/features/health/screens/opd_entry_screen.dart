import 'package:flutter/material.dart';

class OpdEntryScreen extends StatefulWidget {
  const OpdEntryScreen({super.key});

  @override
  State<OpdEntryScreen> createState() => _OpdEntryScreenState();
}

class _OpdEntryScreenState extends State<OpdEntryScreen> {
  final _studentIdController = TextEditingController();
  String? _selectedSymptom;
  String _selectedMedicine = 'Paracetamol';
  bool _studentFound = false;
  // Mock Data
  final Map<String, dynamic> _studentData = {
    'name': 'John Doe',
    'class': 'Class 5-A',
    'allergies': ['Peanuts', 'Penicillin'],
  };

  void _searchStudent() {
    setState(() => _studentFound = true); // Mock found
  }

  void _submit() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Treatment Logged. Inventory Updated.')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OPD Entry'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return Center(child: SizedBox(width: 600, child: Card(child: Padding(padding: const EdgeInsets.all(32), child: _buildForm()))));
          }
          return SingleChildScrollView(padding: const EdgeInsets.all(16), child: _buildForm());
        },
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _studentIdController,
                decoration: const InputDecoration(labelText: 'Student ID / Scan Barcode', border: OutlineInputBorder(), prefixIcon: Icon(Icons.qr_code_scanner)),
              ),
            ),
            const SizedBox(width: 16),
            ElevatedButton(onPressed: _searchStudent, child: const Text('Search')),
          ],
        ),
        const SizedBox(height: 16),
        if (_studentFound) ...[
          Card(
            color: Colors.blue.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_studentData['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text(_studentData['class']),
                  const SizedBox(height: 8),
                  if ((_studentData['allergies'] as List).isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(8),
                      color: Colors.red.shade100,
                      child: Row(
                        children: [
                          const Icon(Icons.warning, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(child: Text('Allergies: ${(_studentData['allergies'] as List).join(", ")}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Symptoms', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: ['Fever', 'Headache', 'Stomach Ache', 'Injury', 'Nausea'].map((s) {
              return ChoiceChip(
                label: Text(s),
                selected: _selectedSymptom == s,
                onSelected: (b) => setState(() => _selectedSymptom = b ? s : null),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          DropdownButtonFormField<String>(
            value: _selectedMedicine,
            items: ['Paracetamol', 'Bandage', 'Antacid', 'Ointment'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) => setState(() => _selectedMedicine = v!),
            decoration: const InputDecoration(labelText: 'Medicine Given', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          const TextField(
            maxLines: 2,
            decoration: InputDecoration(labelText: 'Remarks', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _submit,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
            child: const Text('Log Treatment'),
          ),
        ],
      ],
    );
  }
}
