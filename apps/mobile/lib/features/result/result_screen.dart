import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:confetti/confetti.dart';

class ResultScreen extends StatefulWidget {
  final String studentId;
  final double percentage; // Passed from navigation or state
  final int rank; // Passed from navigation or state

  const ResultScreen({
    Key? key,
    required this.studentId,
    this.percentage = 0.0,
    this.rank = 0,
  }) : super(key: key);

  @override
  _ResultScreenState createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));

    // 6.I.09: Celebration Animation Logic
    if (widget.percentage > 80.0 || (widget.rank > 0 && widget.rank <= 3)) {
      _confettiController.play();
    }
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  Future<void> _shareOnWhatsApp(BuildContext context) async {
    // 1. Call create-link API (Mock logic for now as we don't have http client setup here)
    // String url = await ApiService.createShareLink(studentId);
    String url = "https://ed.app/r/result-${widget.studentId}"; // Mock URL

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
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch WhatsApp')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Result')),
      body: Stack(
        children: [
          // Main Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Student Result Display Here',
                  style: TextStyle(fontSize: 18),
                ),
                SizedBox(height: 10),
                Text('Percentage: ${widget.percentage}%'),
                Text('Rank: ${widget.rank}'),
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

          // Confetti Overlay (Top Center)
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [
                Colors.green,
                Colors.blue,
                Colors.pink,
                Colors.orange,
                Colors.purple
              ],
            ),
          ),
        ],
      ),
    );
  }
}
