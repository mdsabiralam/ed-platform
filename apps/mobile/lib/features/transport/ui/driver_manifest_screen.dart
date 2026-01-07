import 'package:flutter/material.dart';
import 'package:mobile/features/transport/services/background_location_service.dart';

class DriverManifestScreen extends StatefulWidget {
  const DriverManifestScreen({Key? key}) : super(key: key);

  @override
  State<DriverManifestScreen> createState() => _DriverManifestScreenState();
}

class _DriverManifestScreenState extends State<DriverManifestScreen> {
  bool isTracking = false;

  @override
  void initState() {
    super.initState();
    // 12.G.03 Battery Optimization: We assume the service uses the settings configured in the service file.
  }

  void _toggleTracking() async {
    if (isTracking) {
      await BackgroundLocationService.stop();
    } else {
      await BackgroundLocationService.start();
    }
    setState(() {
      isTracking = !isTracking;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 12.G.02 Driver Manifest UI
    return Scaffold(
      appBar: AppBar(title: const Text("Driver Manifest")),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // High Contrast, Large Fonts
                    const Text(
                      "NEXT STOP",
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      "Main Street",
                      style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.black), // High contrast
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 40),
                    const Text(
                      "STUDENT COUNT",
                      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      "3 Kids",
                      style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.blueAccent),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: SizedBox(
                width: double.infinity,
                height: 80, // Large button
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green, // High visibility
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    // Logic to mark arrived
                  },
                  child: const Text(
                    "ARRIVED",
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 24.0, left: 24.0, right: 24.0),
              child: SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isTracking ? Colors.red : Colors.blue,
                  ),
                  onPressed: _toggleTracking,
                  child: Text(
                    isTracking ? "STOP TRIP" : "START TRIP",
                    style: const TextStyle(fontSize: 24, color: Colors.white),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
