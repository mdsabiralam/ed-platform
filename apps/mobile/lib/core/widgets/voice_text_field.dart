import 'package:flutter/material.dart';
import 'package:mobile/core/services/voice_service.dart';

class VoiceTextField extends StatefulWidget {
  final TextEditingController controller;
  final String hintText;
  final int? maxLines;

  const VoiceTextField({
    super.key,
    required this.controller,
    this.hintText = 'Enter text...',
    this.maxLines = 1,
  });

  @override
  State<VoiceTextField> createState() => _VoiceTextFieldState();
}

class _VoiceTextFieldState extends State<VoiceTextField> {
  final VoiceService _voiceService = VoiceService();
  bool _isListening = false;

  void _toggleListening() async {
    if (_isListening) {
      await _voiceService.stopListening();
      setState(() {
        _isListening = false;
      });
    } else {
      bool available = await _voiceService.startListening((text) {
        setState(() {
          // If speech_to_text returns partial results, we might want to append or replace.
          // Usually it returns the cumulative result for the session.
          // We'll simplisticly replace or append to current cursor position.

          // For simplicity, let's just append to the end or replace logic if needed.
          // Here we just set the text for the demo.
          widget.controller.text = text;
        });
      });

      if (available) {
        setState(() {
          _isListening = true;
        });
      } else {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Speech recognition not available/permission denied.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: widget.controller,
      maxLines: widget.maxLines,
      decoration: InputDecoration(
        hintText: widget.hintText,
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          icon: Icon(
            _isListening ? Icons.mic : Icons.mic_none,
            color: _isListening ? Colors.red : Colors.grey,
          ),
          onPressed: _toggleListening,
        ),
      ),
    );
  }
}
