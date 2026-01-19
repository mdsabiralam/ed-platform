import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class StudentDiaryScreen extends StatefulWidget {
  final String studentId;
  const StudentDiaryScreen({super.key, required this.studentId});

  @override
  State<StudentDiaryScreen> createState() => _StudentDiaryScreenState();
}

class _StudentDiaryScreenState extends State<StudentDiaryScreen> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  String _currentLocaleId = 'en_US';
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('onStatus: $val'),
        onError: (val) => print('onError: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          localeId: _currentLocaleId,
          onResult: (val) => setState(() {
            _textController.text = val.recognizedWords;
          }),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Diary')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Language Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Text('Input Language:', style: TextStyle(fontSize: 16)),
                const SizedBox(width: 10),
                DropdownButton<String>(
                  value: _currentLocaleId,
                  items: const [
                    DropdownMenuItem(value: 'en_US', child: Text('English')),
                    DropdownMenuItem(value: 'bn_BD', child: Text('Bangla')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _currentLocaleId = val);
                  },
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _textController,
              maxLines: 5,
              style: const TextStyle(fontSize: 18), // Bigger text
              decoration: const InputDecoration(
                labelText: 'Remark',
                labelStyle: TextStyle(fontSize: 18),
                hintText: 'Enter remark or use microphone...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            FloatingActionButton.large( // Bigger button
              onPressed: _listen,
              child: Icon(_isListening ? Icons.mic : Icons.mic_none, size: 36),
              backgroundColor: _isListening ? Colors.red : Colors.blue,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Save logic
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Remark Saved')),
                );
              },
              child: const Text('Save Remark'),
            )
          ],
        ),
      ),
    );
  }
}
