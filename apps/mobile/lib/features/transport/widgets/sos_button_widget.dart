import 'package:flutter/material.dart';

class SosButtonWidget extends StatelessWidget {
  const SosButtonWidget({super.key});

  void _triggerSOS(BuildContext context) {
    // Mock API
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.red,
        title: const Text('EMERGENCY ALERT SENT!', style: TextStyle(color: Colors.white)),
        content: const Text('Help is on the way. Location shared with Admin.', style: TextStyle(color: Colors.white)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Dismiss', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () => _triggerSOS(context),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: Colors.redAccent,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.red.withOpacity(0.5), blurRadius: 10, spreadRadius: 2),
          ],
        ),
        child: const Icon(Icons.sos, color: Colors.white, size: 30),
      ),
    );
  }
}
