import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'dart:async';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class AutoPilotDashboard extends StatefulWidget {
  const AutoPilotDashboard({super.key});

  @override
  State<AutoPilotDashboard> createState() => _AutoPilotDashboardState();
}

class _AutoPilotDashboardState extends State<AutoPilotDashboard> {
  final FlutterTts _flutterTts = FlutterTts();
  final stt.SpeechToText _speech = stt.SpeechToText();

  // Console State
  final List<String> _consoleLogs = [];
  final ScrollController _scrollController = ScrollController();

  // Logic State
  bool _isProcessing = false;
  String _currentStep = 'Idle';
  Map<String, dynamic>? _currentRequest;

  @override
  void initState() {
    super.initState();
    _initTts();
    _startPolling();
  }

  void _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setSpeechRate(0.5);
  }

  void _startPolling() {
    // Mock Polling for requests
    Timer.periodic(const Duration(seconds: 10), (timer) {
      if (!_isProcessing) {
        _fetchNextRequest();
      }
    });
  }

  Future<void> _fetchNextRequest() async {
    // Mock Fetch from API
    // GET /concierge/staff/pending-requests
    await Future.delayed(const Duration(seconds: 1));

    // Simulating a found request
    final mockRequest = {
      'id': 'req-123',
      'schoolName': 'Dhaka City School',
      'className': 'Class 10',
      'subject': 'Physics',
      'teacherName': 'Mr. Ahmed',
      'topic': 'Newton\'s Laws',
      'questionType': 'MCQ',
    };

    _processRequest(mockRequest);
  }

  Future<void> _processRequest(Map<String, dynamic> request) async {
    setState(() {
      _isProcessing = true;
      _currentRequest = request;
    });

    // Step 1: Processing Request
    await _speakAndLog(
      "Processing request for ${request['schoolName']}, ${request['className']}, Subject ${request['subject']}.",
    );

    // Step 2: Generation details
    await _speakAndLog(
      "Teacher ${request['teacherName']} asked for questions from ${request['topic']}. I have generated 10 MCQs.",
    );

    // Step 3: Context Injection (Fetch Students)
    // Mock Fetch /academic/student/sample
    final students = ['Rahim', 'Karim', 'Sultana']; // Mocked response

    // Step 4: Assignment Proposal
    await _speakAndLog(
      "Assigning this to ${students[0]}, ${students[1]}, and others. Mr. Staff, shall I publish?",
    );

    _listenForConfirmation();
  }

  Future<void> _speakAndLog(String text) async {
    setState(() {
      _consoleLogs.add("> $text");
      _currentStep = text;
    });
    _scrollToBottom();
    await _flutterTts.speak(text);
    await _flutterTts.awaitSpeakCompletion(true);
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _listenForConfirmation() async {
    bool available = await _speech.initialize();
    if (available) {
      setState(() => _consoleLogs.add("[Listening for 'Yes, Send it']..."));
      _speech.listen(
        onResult: (val) {
          if (val.recognizedWords.toLowerCase().contains("send it")) {
            _publish();
          }
        },
      );
    } else {
      setState(
        () => _consoleLogs.add("[Mic unavailable, waiting for manual click]"),
      );
    }
  }

  void _publish() {
    _speech.stop();
    setState(() {
      _consoleLogs.add("[System] Publishing Assignment...");
      _currentRequest = null;
      _isProcessing = false;
    });
    _speakAndLog("Assignment published successfully.");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AutoPilot Dashboard')),
      body: Row(
        children: [
          // Left: Live Console
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.black,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "LIVE CONSOLE",
                    style: TextStyle(
                      color: Colors.green,
                      fontFamily: 'Courier',
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Divider(color: Colors.green),
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: _consoleLogs.length,
                      itemBuilder: (context, index) {
                        return Text(
                          _consoleLogs[index],
                          style: const TextStyle(
                            color: Colors.greenAccent,
                            fontFamily: 'Courier',
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Right: Preview Area
          Expanded(
            flex: 1,
            child: Container(
              color: Colors.grey[100],
              padding: const EdgeInsets.all(24),
              child: _currentRequest == null
                  ? const Center(
                      child: Text(
                        "Scanning for requests...",
                        style: TextStyle(fontSize: 18, color: Colors.grey),
                      ),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.school, size: 64, color: Colors.blue),
                        const SizedBox(height: 16),
                        Text(
                          "${_currentRequest!['schoolName']}",
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          "${_currentRequest!['className']} - ${_currentRequest!['subject']}",
                          style: const TextStyle(fontSize: 18),
                        ),
                        const SizedBox(height: 32),
                        Card(
                          elevation: 4,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                const Text(
                                  "Quiz Preview",
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const Divider(),
                                Text("Topic: ${_currentRequest!['topic']}"),
                                const Text("Questions: 10 MCQs generated"),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton(
                          onPressed: _publish,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                          child: const Text(
                            "Yes, Send it (Manual)",
                            style: TextStyle(fontSize: 18),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
