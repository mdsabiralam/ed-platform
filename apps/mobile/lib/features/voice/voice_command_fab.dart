import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/services/voice_service.dart';

class VoiceCommandFab extends StatefulWidget {
  const VoiceCommandFab({super.key});

  @override
  State<VoiceCommandFab> createState() => _VoiceCommandFabState();
}

class _VoiceCommandFabState extends State<VoiceCommandFab> with SingleTickerProviderStateMixin {
  final VoiceService _voiceService = VoiceService();
  bool _isListening = false;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    // Check permissions on init
    _voiceService.checkPermission();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _startListening() async {
    setState(() {
      _isListening = true;
    });
    await _voiceService.startRecording();
  }

  void _stopListeningAndProcess() async {
    setState(() {
      _isListening = false;
    });

    // Show loading indicator dialog
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final responseStr = await _voiceService.stopRecordingAndSend();

    if (!mounted) return;
    Navigator.of(context).pop(); // Close loading dialog

    if (responseStr != null) {
      try {
        final data = jsonDecode(responseStr);
        final intent = data['intent'];
        final redirectUrl = data['redirectUrl'];
        final text = data['text'];

        // Show feedback
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Heard: "$text" (Action: $intent)')),
        );

        // Navigation Logic (Prompt 5 mapping)
        if (redirectUrl != null) {
          // Note: In a real app, you might need to parse query params or clean the URL
          // to match GoRouter paths if they differ.
          // Assuming API returns valid paths like '/finance/student-dues'

          // For now, since those routes might not exist in our simple app,
          // we just print or try to go.
          try {
            context.push(redirectUrl);
          } catch (e) {
             ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Route not implemented yet: $redirectUrl')),
            );
          }
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to parse command response')),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Voice command failed. Please try again.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: _startListening,
      onLongPressUp: _stopListeningAndProcess,
      child: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: _isListening ? Colors.red.withOpacity(0.5) : Colors.blue.withOpacity(0.3),
              blurRadius: 10,
              spreadRadius: _isListening ? 10 : 2,
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: () {
             ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Hold to speak...')),
              );
          },
          backgroundColor: _isListening ? Colors.red : Colors.blue,
          child: _isListening
              ? ScaleTransition(
                  scale: Tween(begin: 1.0, end: 1.2).animate(_animationController),
                  child: const Icon(Icons.mic, size: 30),
                )
              : const Icon(Icons.mic, size: 30),
        ),
      ),
    );
  }
}
