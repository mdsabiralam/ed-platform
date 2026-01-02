import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class StudentResultScreen extends StatefulWidget {
  final String studentId;
  final String examId;
  final String studentName;
  final double percentage;
  final int rank;

  const StudentResultScreen({
    Key? key,
    required this.studentId,
    required this.examId,
    required this.studentName,
    required this.percentage,
    required this.rank,
  }) : super(key: key);

  @override
  _StudentResultScreenState createState() => _StudentResultScreenState();
}

class _StudentResultScreenState extends State<StudentResultScreen> {
  late ConfettiController _confettiController;
  bool _isSharing = false;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));

    // Check for celebration condition
    if (widget.percentage > 80.0 || widget.rank <= 3) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _confettiController.play();
      });
    }
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  Future<void> _shareResult() async {
    setState(() {
      _isSharing = true;
    });

    try {
      // In a real app, baseUrl should come from config
      final baseUrl = 'http://10.0.2.2:3001'; // Android Emulator localhost

      final response = await http.post(
        Uri.parse('$baseUrl/api/social/share/create-link'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'studentId': widget.studentId,
          'examId': widget.examId,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final String shareUrl = data['url'];
        final String text = "Proud of my child's result! Check it out here: $shareUrl";
        final String whatsappUrl = "whatsapp://send?text=${Uri.encodeComponent(text)}";

        if (await canLaunchUrl(Uri.parse(whatsappUrl))) {
           await launchUrl(Uri.parse(whatsappUrl));
        } else {
           // Fallback to web whatsapp or generic share if needed,
           // or just show error. For now, try launching generic share if whatsapp fails?
           // The requirement specifically says "Open WhatsApp".
           // Trying universal link as fallback
           final webWhatsappUrl = "https://wa.me/?text=${Uri.encodeComponent(text)}";
           if (await canLaunchUrl(Uri.parse(webWhatsappUrl))) {
             await launchUrl(Uri.parse(webWhatsappUrl), mode: LaunchMode.externalApplication);
           } else {
             ScaffoldMessenger.of(context).showSnackBar(
               const SnackBar(content: Text('Could not launch WhatsApp')),
             );
           }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate share link: ${response.statusCode}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error sharing result: $e')),
      );
    } finally {
      setState(() {
        _isSharing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Result Summary'),
        backgroundColor: Colors.blueAccent,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      children: [
                        const CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.blue,
                          child: Icon(Icons.person, size: 40, color: Colors.white),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.studentName,
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Class Rank: ${widget.rank}',
                          style: const TextStyle(fontSize: 18, color: Colors.orange),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Percentage: ${widget.percentage.toStringAsFixed(2)}%',
                          style: const TextStyle(fontSize: 18, color: Colors.green),
                        ),
                        const SizedBox(height: 24),
                        const Divider(),
                        const SizedBox(height: 16),
                        // Marks details would go here
                        const Text("Marks Details (Placeholder)"),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: _isSharing ? null : _shareResult,
                  icon: _isSharing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.share),
                  label: Text(_isSharing ? 'Generating Link...' : 'Share on WhatsApp'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green, // WhatsApp color
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [Colors.green, Colors.blue, Colors.pink, Colors.orange, Colors.purple],
            ),
          ),
        ],
      ),
    );
  }
}
