import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PassengerManifestScreen extends StatefulWidget {
  const PassengerManifestScreen({super.key});

  @override
  State<PassengerManifestScreen> createState() => _PassengerManifestScreenState();
}

class _PassengerManifestScreenState extends State<PassengerManifestScreen> {
  // Mock Data
  final List<Map<String, dynamic>> _stops = [
    {
      'stopName': 'Main Street Stop',
      'students': [
        {'id': 1, 'name': 'Alice', 'boarded': false},
        {'id': 2, 'name': 'Bob', 'boarded': false},
      ]
    },
    {
      'stopName': 'City Park Stop',
      'students': [
        {'id': 3, 'name': 'Charlie', 'boarded': false},
      ]
    },
  ];

  void _toggleBoarding(int stopIndex, int studentIndex) {
    setState(() {
      _stops[stopIndex]['students'][studentIndex]['boarded'] = !_stops[stopIndex]['students'][studentIndex]['boarded'];
    });

    if (_stops[stopIndex]['students'][studentIndex]['boarded']) {
      // Mock API & SMS
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Marked Boarded. SMS Sent to Parent.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Passenger List'),
        backgroundColor: Colors.amber.shade700,
        actions: [
          IconButton(icon: const Icon(Icons.map), onPressed: () {}), // Switch to map view
        ],
      ),
      body: ListView.builder(
        itemCount: _stops.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Container(
              padding: const EdgeInsets.all(16),
              color: Colors.amber.shade100,
              child: const Text('Next Stop: Main Street (2 mins)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            );
          }
          final stop = _stops[index - 1];
          final students = stop['students'] as List;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(stop['stopName'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ),
              ...students.asMap().entries.map((entry) {
                final sIndex = entry.key;
                final student = entry.value;
                return ListTile(
                  leading: CircleAvatar(child: Text(student['name'][0])),
                  title: Text(student['name']),
                  trailing: Transform.scale(
                    scale: 1.5,
                    child: Checkbox(
                      value: student['boarded'],
                      onChanged: (v) => _toggleBoarding(index - 1, sIndex),
                      activeColor: Colors.green,
                      shape: const CircleBorder(),
                    ),
                  ),
                );
              }),
              const Divider(),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/driver/dashboard'), // End Trip / Back
        child: const Icon(Icons.stop),
        backgroundColor: Colors.red,
      ),
    );
  }
}
