import 'package:flutter/material.dart';

enum ServiceBookEventType {
  Appointment,
  Probation_Clearance,
  Confirmation,
  Promotion,
  Transfer,
  Suspension,
  Termination
}

class ServiceBookEvent {
  final String id;
  final DateTime eventDate;
  final ServiceBookEventType eventType;
  final String? documentUrl;
  final String? authorizedBy;

  ServiceBookEvent({
    required this.id,
    required this.eventDate,
    required this.eventType,
    this.documentUrl,
    this.authorizedBy,
  });
}

class ServiceBookTimeline extends StatelessWidget {
  final List<ServiceBookEvent> events;

  const ServiceBookTimeline({Key? key, required this.events}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (events.isEmpty) {
      return const Center(child: Text("No service history available."));
    }

    // Sort events by date descending
    final sortedEvents = List<ServiceBookEvent>.from(events)
      ..sort((a, b) => b.eventDate.compareTo(a.eventDate));

    return ListView.builder(
      itemCount: sortedEvents.length,
      padding: const EdgeInsets.all(16.0),
      itemBuilder: (context, index) {
        final event = sortedEvents[index];
        return _buildTimelineItem(context, event, index == sortedEvents.length - 1);
      },
    );
  }

  Widget _buildTimelineItem(BuildContext context, ServiceBookEvent event, bool isLast) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline Line and Dot
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: _getColorForEvent(event.eventType),
                  shape: BoxShape.circle,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: Colors.grey.shade300,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Event Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24.0),
              child: Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _formatDate(event.eventDate),
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _getEventTitle(event.eventType),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (event.documentUrl != null) ...[
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: () {
                            // TODO: Handle document open
                          },
                          icon: const Icon(Icons.description, size: 16),
                          label: const Text("View Document"),
                        ),
                      ],
                      if (event.authorizedBy != null) ...[
                         const SizedBox(height: 4),
                         Text(
                           "Authorized by: ${event.authorizedBy}",
                           style: TextStyle(
                             color: Colors.grey.shade400,
                             fontSize: 10
                           ),
                         )
                      ]
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getColorForEvent(ServiceBookEventType type) {
    switch (type) {
      case ServiceBookEventType.Appointment:
        return Colors.green;
      case ServiceBookEventType.Promotion:
        return Colors.blue;
      case ServiceBookEventType.Termination:
      case ServiceBookEventType.Suspension:
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  String _getEventTitle(ServiceBookEventType type) {
    return type.toString().split('.').last.replaceAll('_', ' ');
  }

  String _formatDate(DateTime date) {
    return "${date.day}/${date.month}/${date.year}";
  }
}
