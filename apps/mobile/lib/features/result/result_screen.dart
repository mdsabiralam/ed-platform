import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ResultScreen extends StatelessWidget {
  final String studentId;

  const ResultScreen({Key? key, required this.studentId}) : super(key: key);

  Future<void> _shareOnWhatsApp(BuildContext context) async {
    // 1. Call create-link API (Mock logic for now as we don't have http client setup here)
    // String url = await ApiService.createShareLink(studentId);
    String url = "https://ed.app/r/result-$studentId"; // Mock URL

    // 2. Open WhatsApp
    final String text = "Proud of my child's result! Check it out here: $url";
    final Uri whatsappUri = Uri.parse("whatsapp://send?text=${Uri.encodeComponent(text)}");
    final Uri webUri = Uri.parse("https://wa.me/?text=${Uri.encodeComponent(text)}");

    try {
      if (await canLaunchUrl(whatsappUri)) {
        await launchUrl(whatsappUri);
      } else {
        // Fallback to web
        await launchUrl(webUri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not launch WhatsApp')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Result')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Student Result Display Here'),
            SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => _shareOnWhatsApp(context),
              icon: Icon(Icons.share),
              label: Text('Share on WhatsApp'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green, // WhatsApp color
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
