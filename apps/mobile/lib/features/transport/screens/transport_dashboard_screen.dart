import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:mobile/features/transport/screens/vehicle_list_screen.dart';
import 'package:mobile/features/transport/screens/route_management_screen.dart';

class TransportDashboardScreen extends StatelessWidget {
  const TransportDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transport Command Center'),
        backgroundColor: Colors.amber.shade700,
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
      length: 3,
      child: Column(
        children: [
          const TabBar(
            labelColor: Colors.amber,
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(text: 'Vehicles'),
              Tab(text: 'Routes'),
              Tab(text: 'Live Map'),
            ],
          ),
          Expanded(
            child: TabBarView(
              physics: const NeverScrollableScrollPhysics(), // Map gesture conflict
              children: [
                const VehicleListScreen(), // Embedding existing screen
                const RouteManagementScreen(), // Embedding
                const GoogleMap(initialCameraPosition: CameraPosition(target: LatLng(23.8103, 90.4125), zoom: 12)),
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
        SizedBox(
          width: 400,
          child: DefaultTabController(
            length: 2,
            child: Column(
              children: [
                const TabBar(
                  labelColor: Colors.amber,
                  unselectedLabelColor: Colors.grey,
                  tabs: [
                    Tab(text: 'Vehicles'),
                    Tab(text: 'Routes'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      // Using simpler widgets or constrained versions of the full screens to avoid nested scaffolds issues
                      // But for now, embedding is fine as long as we handle navigation correctly
                      const VehicleListScreen(),
                      const RouteManagementScreen(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: Stack(
            children: [
              const GoogleMap(
                initialCameraPosition: CameraPosition(target: LatLng(23.8103, 90.4125), zoom: 12),
              ),
              Positioned(
                top: 24,
                right: 24,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Live Stats', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        _buildStatusRow('Moving', 12, Colors.green),
                        _buildStatusRow('Idle', 4, Colors.orange),
                        _buildStatusRow('Offline', 2, Colors.grey),
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

  Widget _buildStatusRow(String label, int count, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.circle, size: 12, color: color),
        const SizedBox(width: 8),
        Text('$label: $count'),
      ],
    );
  }
}
