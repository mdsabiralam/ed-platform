import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ConciergeRequestScreen extends StatefulWidget {
  const ConciergeRequestScreen({super.key});

  @override
  State<ConciergeRequestScreen> createState() => _ConciergeRequestScreenState();
}

class _ConciergeRequestScreenState extends State<ConciergeRequestScreen> {
  // Placeholder for camera and audio
  bool _isRecording = false;
  String? _imagePath;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Service')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Camera Section
            GestureDetector(
              onTap: _takePhoto,
              child: Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey),
                ),
                child: _imagePath != null
                    ? Image.network(_imagePath!, fit: BoxFit.cover) // Mock network image
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.camera_alt, size: 50, color: Colors.grey),
                          SizedBox(height: 8),
                          Text('Tap to take photo of textbook'),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // Voice Note Section
            const Text('Instructions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  IconButton(
                    icon: Icon(_isRecording ? Icons.stop_circle : Icons.mic),
                    iconSize: 48,
                    color: _isRecording ? Colors.red : Colors.blue,
                    onPressed: _toggleRecording,
                  ),
                  Text(_isRecording ? 'Recording... Tap to stop' : 'Tap to record voice instructions'),
                  if (!_isRecording) ...[
                    const SizedBox(height: 8),
                    const Text('e.g., "Make 10 MCQs from page 42"', style: TextStyle(fontStyle: FontStyle.italic)),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isLoading ? null : _submitRequest,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: _isLoading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Send Request', style: TextStyle(fontSize: 18)),
            ),

            const SizedBox(height: 24),
            const Divider(),
             const SizedBox(height: 16),
             const Text('Recent Requests', style: TextStyle(fontWeight: FontWeight.bold)),
             // List of status trackers would go here
             const ListTile(
               leading: CircleAvatar(backgroundColor: Colors.orange, child: Icon(Icons.pending, color: Colors.white)),
               title: Text('Chapter 3 Summary'),
               subtitle: Text('Processing by Ed-Support Team...'),
               trailing: Text('Today'),
             ),
          ],
        ),
      ),
    );
  }

  void _takePhoto() {
    // Mock photo taking
    setState(() {
      _imagePath = 'https://via.placeholder.com/400x300';
    });
  }

  void _toggleRecording() {
    setState(() {
      _isRecording = !_isRecording;
    });
  }

  Future<void> _submitRequest() async {
    if (_imagePath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please take a photo first')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // In real app: Upload image first to storage, get URL, then send request
      // Here we assume _imagePath is the URL
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/concierge/request'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <token>',
        },
        body: jsonEncode({
          'rawImageUrl': _imagePath,
          'instructionText': 'Recorded voice note transcript...', // Mock transcript
        }),
      );

      if (response.statusCode == 201) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Request sent successfully!')),
          );
        }
      } else {
        throw Exception('Failed to create request');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
}
