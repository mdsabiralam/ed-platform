import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class RouteManagementScreen extends StatelessWidget {
  const RouteManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Route Manager'),
        backgroundColor: Colors.amber.shade700,
        actions: [
          ElevatedButton.icon(
            icon: const Icon(Icons.add, color: Colors.black),
            label: const Text('Create Route', style: TextStyle(color: Colors.black)),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white),
            onPressed: () {},
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text('Route ${index + 1} - Downtown'),
            subtitle: const Text('5 Stops • 12 km'),
            trailing: IconButton(icon: const Icon(Icons.edit), onPressed: () {}), // Open Editor
          ),
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    // Editor View
    return Row(
      children: [
        SizedBox(
          width: 350,
          child: Column(
            children: [
              const ListTile(title: Text('Stops (Drag to Reorder)', style: TextStyle(fontWeight: FontWeight.bold))),
              Expanded(
                child: ReorderableListView(
                  onReorder: (oldIndex, newIndex) {},
                  children: List.generate(5, (index) {
                    return ListTile(
                      key: ValueKey(index),
                      leading: CircleAvatar(backgroundColor: Colors.amber, child: Text('${index + 1}')),
                      title: Text('Stop Name ${index + 1}'),
                      trailing: const Icon(Icons.drag_handle),
                    );
                  }),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50), backgroundColor: Colors.amber.shade700),
                  child: const Text('Save Route'),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Stack(
            children: [
              const GoogleMap(
                initialCameraPosition: CameraPosition(target: LatLng(23.8103, 90.4125), zoom: 12),
              ),
              Positioned(
                bottom: 24,
                left: 24,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Map Tools', style: TextStyle(fontWeight: FontWeight.bold)),
                        Row(
                          children: [
                            IconButton(icon: const Icon(Icons.add_location_alt), onPressed: () {}, tooltip: 'Add Marker'),
                            IconButton(icon: const Icon(Icons.timeline), onPressed: () {}, tooltip: 'Draw Polyline'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
