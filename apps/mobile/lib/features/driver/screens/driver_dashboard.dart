
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DriverTripDashboardScreen extends StatelessWidget {
  const DriverTripDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy Data
    final passengers = [
      {'name': 'Alex', 'stop': 'Greenwood Park'},
      {'name': 'Mia', 'stop': 'Oak Street'},
      {'name': 'Leo', 'stop': 'Pine Avenue'},
    ];

    return Scaffold(
      backgroundColor: Colors.grey[900],
      appBar: AppBar(
        title: Text('Trip Dashboard', style: GoogleFonts.lato(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.black,
      ),
      body: Column(
        children: [
          _buildSlideToActButton(),
          Expanded(
            child: ListView.builder(
              itemCount: passengers.length,
              itemBuilder: (context, index) {
                final passenger = passengers[index];
                return Card(
                  color: Colors.grey[800],
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.person_pin_circle, color: Colors.yellow, size: 40),
                    title: Text(passenger['name']!, style: GoogleFonts.lato(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    subtitle: Text(passenger['stop']!, style: GoogleFonts.lato(fontSize: 18, color: Colors.grey[400])),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlideToActButton() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.green,
          borderRadius: BorderRadius.circular(50),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 16.0),
              child: Icon(Icons.arrow_forward_ios, color: Colors.white),
            ),
            Expanded(
              child: Text(
                'SLIDE TO START TRIP',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
