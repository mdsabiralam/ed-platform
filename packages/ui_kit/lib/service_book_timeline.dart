import 'package:flutter/material.dart';
import 'package:timelines/timelines.dart';
import 'package:intl/intl.dart';

enum ServiceEventType {
  joined,
  promoted,
  transferred,
  other,
}

class ServiceBookEvent {
  final DateTime date;
  final String description;
  final ServiceEventType type;

  ServiceBookEvent({
    required this.date,
    required this.description,
    required this.type,
  });
}

class ServiceBookTimeline extends StatelessWidget {
  final List<ServiceBookEvent> events;

  const ServiceBookTimeline({Key? key, required this.events}) : super(key: key);

  Color _getColor(ServiceEventType type) {
    switch (type) {
      case ServiceEventType.joined:
        return Colors.blue;
      case ServiceEventType.promoted:
        return Colors.green;
      case ServiceEventType.transferred:
        return Colors.orange;
      case ServiceEventType.other:
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FixedTimeline.tileBuilder(
      builder: TimelineTileBuilder.connected(
        connectionDirection: ConnectionDirection.before,
        itemCount: events.length,
        contentsBuilder: (context, index) {
          final event = events[index];
          return Padding(
            padding: const EdgeInsets.only(left: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('yyyy-MM-dd').format(event.date),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                Text(
                  event.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 24.0),
              ],
            ),
          );
        },
        indicatorBuilder: (_, index) {
          final type = events[index].type;
          return DotIndicator(
            color: _getColor(type),
            child: Icon(
              Icons.check,
              size: 12.0,
              color: Colors.white,
            ),
          );
        },
        connectorBuilder: (_, index, ___) {
          final type = events[index].type;
          return SolidLineConnector(
            color: _getColor(type),
          );
        },
      ),
    );
  }
}
