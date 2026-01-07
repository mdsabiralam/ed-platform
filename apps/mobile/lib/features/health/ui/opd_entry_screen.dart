import 'package:flutter/material.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/features/health/ui/sos_button.dart';

// 12.G.08 Nurse App (OPD Entry)

class OpdEntryScreen extends StatefulWidget {
  const OpdEntryScreen({Key? key}) : super(key: key);

  @override
  State<OpdEntryScreen> createState() => _OpdEntryScreenState();
}

class _OpdEntryScreenState extends State<OpdEntryScreen> {
  final TextEditingController _studentSearchController = TextEditingController();
  final TextEditingController _treatmentController = TextEditingController();
  final List<String> _commonSymptoms = ['Fever', 'Headache', 'Injury', 'Stomach Ache', 'Cold', 'Nausea'];
  final List<String> _selectedSymptoms = [];

  void _submitOpdEntry() async {
    // Submit to health_records table
    if (_studentSearchController.text.isEmpty || _selectedSymptoms.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please fill all fields")));
      return;
    }

    final apiClient = ApiClient();
    try {
      await apiClient.post('/health/opd-entry', data: {
        'studentId': _studentSearchController.text, // Assuming ID is entered directly or resolved
        'symptoms': _selectedSymptoms,
        'treatment': _treatmentController.text,
        'date': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("OPD Record Saved")));
        // Clear
        setState(() {
          _studentSearchController.clear();
          _treatmentController.clear();
          _selectedSymptoms.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to save record: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("OPD Entry")),
      floatingActionButton: const SosButton(), // 12.G.09 SOS Button
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Student Details", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _studentSearchController,
              decoration: const InputDecoration(
                labelText: "Search Student (Name/ID)",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person_search),
              ),
            ),

            const SizedBox(height: 24),
            const Text("Symptoms", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8.0,
              children: _commonSymptoms.map((symptom) {
                final isSelected = _selectedSymptoms.contains(symptom);
                return FilterChip(
                  label: Text(symptom),
                  selected: isSelected,
                  onSelected: (bool selected) {
                    setState(() {
                      if (selected) {
                        _selectedSymptoms.add(symptom);
                      } else {
                        _selectedSymptoms.remove(symptom);
                      }
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 24),
            const Text("Treatment Given", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _treatmentController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "e.g., Paracetamol 500mg, Bandage applied...",
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _submitOpdEntry,
                child: const Text("SUBMIT RECORD"),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
