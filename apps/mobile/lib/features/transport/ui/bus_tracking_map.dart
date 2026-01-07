import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class BusTrackingMap extends StatefulWidget {
  final String busId;
  final LatLng homeLocation;

  const BusTrackingMap({
    Key? key,
    required this.busId,
    required this.homeLocation,
  }) : super(key: key);

  @override
  State<BusTrackingMap> createState() => _BusTrackingMapState();
}

class _BusTrackingMapState extends State<BusTrackingMap> {
  GoogleMapController? _mapController;
  final StreamController<LatLng> _busLocationStreamController = StreamController<LatLng>();
  LatLng? _currentBusLocation;
  Set<Marker> _markers = {};
  Set<Polyline> _polylines = {};
  String _eta = 'Calculating...';
  Timer? _simulationTimer;

  @override
  void initState() {
    super.initState();
    _startSimulatingBusMovement();
    _busLocationStreamController.stream.listen((location) {
      _updateMap(location);
    });
  }

  @override
  void dispose() {
    _busLocationStreamController.close();
    _simulationTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  // Simulating WebSocket updates
  void _startSimulatingBusMovement() {
    // Start somewhat near home
    double lat = widget.homeLocation.latitude - 0.01;
    double lng = widget.homeLocation.longitude - 0.01;

    _simulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_busLocationStreamController.isClosed) return;

      // Move closer to home
      lat += 0.0005;
      lng += 0.0005;

      _busLocationStreamController.add(LatLng(lat, lng));

      // Calculate fake ETA based on distance
      final distance = (widget.homeLocation.latitude - lat).abs() + (widget.homeLocation.longitude - lng).abs();
      final minutes = (distance * 1000).toInt(); // Rough estimation
      setState(() {
        _eta = minutes <= 0 ? 'Arrived' : '$minutes mins';
      });
    });
  }

  void _updateMap(LatLng busLocation) {
    setState(() {
      _currentBusLocation = busLocation;
      _markers = {
        Marker(
          markerId: const MarkerId('home'),
          position: widget.homeLocation,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          infoWindow: const InfoWindow(title: 'Home'),
        ),
        Marker(
          markerId: const MarkerId('bus'),
          position: busLocation,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange), // Ideally custom icon
          infoWindow: const InfoWindow(title: 'School Bus'),
          rotation: 0, // Could calculate bearing
        ),
      };

      _polylines = {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [busLocation, widget.homeLocation],
          color: Colors.blue,
          width: 5,
        ),
      };
    });

    _mapController?.animateCamera(
      CameraUpdate.newLatLng(busLocation),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Live Tracking', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('ETA: $_eta', style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        Expanded(
          child: GoogleMap(
            initialCameraPosition: CameraPosition(
              target: widget.homeLocation,
              zoom: 14,
            ),
            markers: _markers,
            polylines: _polylines,
            onMapCreated: (controller) {
              _mapController = controller;
              if (_currentBusLocation != null) {
                _updateMap(_currentBusLocation!);
              }
            },
          ),
        ),
      ],
    );
  }
}
