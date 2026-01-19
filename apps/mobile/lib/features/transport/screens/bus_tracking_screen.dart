import 'package:flutter/material.dart';
import 'dart:async';

class BusTrackingScreen extends StatefulWidget {
  final String vehicleId;
  const BusTrackingScreen({super.key, required this.vehicleId});

  @override
  State<BusTrackingScreen> createState() => _BusTrackingScreenState();
}

class _BusTrackingScreenState extends State<BusTrackingScreen> {
  // Mock location
  double latitude = 23.8103;
  double longitude = 90.4125;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Poll every 10 seconds as requested
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _fetchLocation();
    });
  }

  Future<void> _fetchLocation() async {
    // Simulate API call to GET /transport/live/:vehicleId
    // In real app: final loc = await api.get('/transport/live/${widget.vehicleId}');

    // Simulate movement
    if (mounted) {
      setState(() {
        latitude += 0.0001;
        longitude += 0.0001;
      });
      print("Updated bus location: $latitude, $longitude");
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Bus Tracking")),
      body: Stack(
        children: [
          // Simulated Map Background
          Container(
            color: Colors.grey[300],
            child: Center(
              child: Text(
                "Map View Placeholder\nLat: ${latitude.toStringAsFixed(4)}\nLong: ${longitude.toStringAsFixed(4)}",
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 18, color: Colors.black54),
              ),
            ),
          ),
          // Bus Icon (Simulated on top of map)
          const Positioned(
            top: 200,
            left: 150, // Fixed position for demo, but data updates text
            child: Icon(Icons.directions_bus, size: 50, color: Colors.blue),
          ),
          const Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text("Bus is moving... Updating every 10s"),
              ),
            ),
          )
        ],
      ),
    );
  }
}
