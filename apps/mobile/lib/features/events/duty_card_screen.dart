import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/models/event_duty.dart';
import '../../core/services/events_service.dart';
import '../../core/api_client.dart';

class DutyCardScreen extends StatefulWidget {
  final String profileId;

  const DutyCardScreen({Key? key, required this.profileId}) : super(key: key);

  @override
  _DutyCardScreenState createState() => _DutyCardScreenState();
}

class _DutyCardScreenState extends State<DutyCardScreen> {
  late Future<List<EventDuty>> _dutiesFuture;
  // In a real app, you'd use a provider/GetIt for the service
  final EventsService _eventsService = EventsService(ApiClient());

  @override
  void initState() {
    super.initState();
    _dutiesFuture = _eventsService.getMyDuties(widget.profileId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Digital Duty Pass'),
        backgroundColor: Colors.indigo,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.indigo.shade50, Colors.white],
          ),
        ),
        child: FutureBuilder<List<EventDuty>>(
          future: _dutiesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const Center(child: Text('No upcoming duties found.'));
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final duty = snapshot.data![index];
                return _buildDutyCard(duty);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildDutyCard(EventDuty duty) {
    final dateFormat = DateFormat('EEEE, MMM d, yyyy');
    final timeFormat = DateFormat('h:mm a');

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      margin: const EdgeInsets.only(bottom: 20),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: const LinearGradient(
            colors: [Color(0xFF1A237E), Color(0xFF3949AB)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Icon(
                    Icons.verified_user,
                    color: Colors.white,
                    size: 30,
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.greenAccent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.greenAccent),
                    ),
                    child: Text(
                      'OFFICIAL PASS',
                      style: TextStyle(
                        color: Colors.greenAccent.shade100,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Event Name
              Text(
                duty.eventName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),

              // Role
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Role: ${duty.roleDescription}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 25),

              // Details Grid
              Row(
                children: [
                  _buildDetailItem(
                    Icons.calendar_today,
                    'Date',
                    dateFormat.format(duty.startTime),
                  ),
                  const SizedBox(width: 20),
                  _buildDetailItem(
                    Icons.access_time,
                    'Time',
                    '${timeFormat.format(duty.startTime)}',
                  ),
                ],
              ),
              const SizedBox(height: 15),
              _buildDetailItem(
                Icons.location_on,
                'Location',
                duty.eventLocation,
              ),

              const SizedBox(height: 20),
              const Divider(color: Colors.white24),
              Center(
                child: Text(
                  'Show this pass at entry',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Expanded(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.white70, size: 18),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 12,
                  ),
                ),
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
