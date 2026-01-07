import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart'; // Ensure this package is added to pubspec.yaml

class ClassObservationForm extends StatefulWidget {
  const ClassObservationForm({super.key});

  @override
  State<ClassObservationForm> createState() => _ClassObservationFormState();
}

class _ClassObservationFormState extends State<ClassObservationForm> {
  String? _selectedTeacher;
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _remarksController = TextEditingController();

  // Criteria scores
  final Map<String, double> _scores = {
    'Discipline': 3.0,
    'Content Delivery': 3.0,
    'Student Engagement': 3.0,
    'Use of Resources': 3.0,
    'Time Management': 3.0,
  };

  final List<String> _teachers = ['Mr. Smith', 'Ms. Doe', 'Mrs. Johnson'];

  void _submit() {
    // API Call to submit
    debugPrint('Submitted: $_selectedTeacher, Scores: $_scores, Remarks: ${_remarksController.text}');
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Class Observation')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedTeacher,
              items: _teachers.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (val) => setState(() => _selectedTeacher = val),
              decoration: const InputDecoration(labelText: 'Select Teacher'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _subjectController,
              decoration: const InputDecoration(labelText: 'Subject'),
            ),
            const SizedBox(height: 20),
            const Text('Evaluation Criteria', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ..._scores.keys.map((criteria) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(criteria),
                    RatingBar.builder(
                      initialRating: _scores[criteria]!,
                      minRating: 1,
                      direction: Axis.horizontal,
                      allowHalfRating: true,
                      itemCount: 5,
                      itemSize: 24,
                      itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                      itemBuilder: (context, _) => const Icon(
                        Icons.star,
                        color: Colors.amber,
                      ),
                      onRatingUpdate: (rating) {
                        setState(() {
                          _scores[criteria] = rating;
                        });
                      },
                    ),
                  ],
                ),
              );
            }).toList(),
            const SizedBox(height: 20),
            TextField(
              controller: _remarksController,
              maxLines: 5,
              decoration: InputDecoration(
                labelText: 'Remarks',
                border: const OutlineInputBorder(),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.mic),
                  onPressed: () {
                    // Trigger Voice-to-Text logic here
                    debugPrint('Voice input triggered');
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                child: const Text('Submit Observation'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
