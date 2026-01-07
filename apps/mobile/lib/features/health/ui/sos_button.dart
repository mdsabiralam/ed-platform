import 'package:flutter/material.dart';
import 'package:mobile/core/api_client.dart';

// 12.G.09 SOS Button (Emergency)

class SosButton extends StatelessWidget {
  const SosButton({Key? key}) : super(key: key);

  void _triggerEmergency(BuildContext context) async {
    final apiClient = ApiClient();
    try {
      await apiClient.post('/health/emergency', data: {
        'timestamp': DateTime.now().toIso8601String(),
        'priority': 'HIGH',
      });

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("EMERGENCY ALERT SENT!"),
            backgroundColor: Colors.red,
            duration: Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to send alert: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () => _triggerEmergency(context), // Long-press to prevent accidental clicks
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.red,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.redAccent, blurRadius: 10, spreadRadius: 2)
          ]
        ),
        padding: const EdgeInsets.all(20),
        child: const Text(
          "SOS",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
    );
  }
}
