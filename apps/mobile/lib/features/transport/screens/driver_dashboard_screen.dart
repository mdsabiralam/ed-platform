import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/transport/widgets/sos_button_widget.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  bool _isTripActive = false;
  double _sliderValue = 0.0;

  void _onSlide(double value) {
    setState(() => _sliderValue = value);
    if (value >= 0.9) {
      if (_isTripActive) {
        _endTrip();
      } else {
        _startTrip();
      }
      // Reset slider visual after action
      Future.delayed(const Duration(milliseconds: 300), () {
        if (mounted) setState(() => _sliderValue = 0.0);
      });
    }
  }

  void _startTrip() {
    setState(() => _isTripActive = true);
    // Mock Background Service Start
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip Started! GPS Tracking On.')));
    context.go('/driver/manifest');
  }

  void _endTrip() {
    setState(() => _isTripActive = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip Ended.')));
  }

  @override
  Widget build(BuildContext context) {
    final color = _isTripActive ? Colors.red : Colors.green;
    final label = _isTripActive ? 'Slide to End Trip' : 'Slide to Start Trip';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver Console'),
        backgroundColor: Colors.black87,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: const SosButtonWidget(),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Route 5 - Downtown', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Vehicle: BUS-101', style: TextStyle(fontSize: 20, color: Colors.grey)),
            const Spacer(),
            // Custom Slider Button Mock
            Container(
              height: 60,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(30),
              ),
              child: Stack(
                children: [
                  Center(child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold))),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: 0.15 + (0.85 * _sliderValue),
                      child: GestureDetector(
                        onHorizontalDragUpdate: (details) {
                          // Simple mock logic for dragging
                          final width = MediaQuery.of(context).size.width - 48;
                          final newValue = (details.localPosition.dx / width).clamp(0.0, 1.0);
                          _onSlide(newValue);
                        },
                        onHorizontalDragEnd: (details) {
                          if (_sliderValue < 0.9) {
                            setState(() => _sliderValue = 0.0);
                          }
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: const Icon(Icons.arrow_forward, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
