import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class VehicleListScreen extends StatelessWidget {
  const VehicleListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Management'),
        backgroundColor: Colors.amber.shade700,
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () {}),
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
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
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            labelColor: Colors.amber,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'All Vehicles'),
              Tab(text: 'Live Map'),
            ],
          ),
          Expanded(
            child: TabBarView(
              physics: const NeverScrollableScrollPhysics(), // Map gesture conflict
              children: [
                _buildVehicleList(),
                _buildMap(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 350, child: _buildVehicleList()),
        Expanded(child: _buildMap()),
      ],
    );
  }

  Widget _buildVehicleList() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        final status = index % 3; // 0: Moving, 1: Idle, 2: Garage
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: ListTile(
            leading: Icon(Icons.directions_bus, color: status == 0 ? Colors.green : (status == 1 ? Colors.orange : Colors.grey)),
            title: Text('Bus ${100 + index}'),
            subtitle: Text(status == 0 ? 'On Route 5 • 45 km/h' : (status == 1 ? 'Idle at School' : 'Garage')),
            trailing: status == 2
               ? const Icon(Icons.build, color: Colors.red) // Maintenance Alert
               : const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {},
          ),
        );
      },
    );
  }

  Widget _buildMap() {
    return const GoogleMap(
      initialCameraPosition: CameraPosition(target: LatLng(23.8103, 90.4125), zoom: 12),
      // In a real app, markers would be dynamic
    );
  }
}
