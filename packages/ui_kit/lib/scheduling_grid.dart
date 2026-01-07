import 'package:flutter/material.dart';

class SchedulingGrid extends StatefulWidget {
  final List<String> periods;
  final List<String> weekdays;
  final Function(int dayIndex, int periodIndex, String data) onDrop;

  const SchedulingGrid({
    Key? key,
    required this.periods,
    required this.weekdays,
    required this.onDrop,
  }) : super(key: key);

  @override
  _SchedulingGridState createState() => _SchedulingGridState();
}

class _SchedulingGridState extends State<SchedulingGrid> {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Sidebar
        Expanded(
          flex: 1,
          child: Column(
            children: [
              const Padding(
                padding: EdgeInsets.all(8.0),
                child: Text('Drag Teacher', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              Expanded(
                child: ListView(
                  children: [
                    _buildDraggableCard('Teacher A - Math'),
                    _buildDraggableCard('Teacher B - Science'),
                    _buildDraggableCard('Teacher C - English'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const VerticalDivider(),
        // Grid
        Expanded(
          flex: 3,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Header Row (Weekdays)
                  Row(
                    children: [
                      const SizedBox(width: 80, height: 50), // Corner spacing
                      ...widget.weekdays.map((day) => Container(
                            width: 100,
                            height: 50,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey),
                              color: Colors.grey[200],
                            ),
                            child: Text(day, style: const TextStyle(fontWeight: FontWeight.bold)),
                          )),
                    ],
                  ),
                  // Rows (Periods)
                  ...List.generate(widget.periods.length, (periodIndex) {
                    return Row(
                      children: [
                        Container(
                          width: 80,
                          height: 100,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey),
                            color: Colors.grey[100],
                          ),
                          child: Text(widget.periods[periodIndex]),
                        ),
                        ...List.generate(widget.weekdays.length, (dayIndex) {
                          return DragTarget<String>(
                            onWillAccept: (data) => true,
                            onAccept: (data) {
                              widget.onDrop(dayIndex, periodIndex, data);
                            },
                            builder: (context, candidateData, rejectedData) {
                              return Container(
                                width: 100,
                                height: 100,
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey),
                                  color: candidateData.isNotEmpty
                                      ? Colors.blue.withOpacity(0.2)
                                      : Colors.white,
                                ),
                                child: Center(
                                  child: candidateData.isNotEmpty
                                      ? Text('Drop Here')
                                      : const Icon(Icons.add, color: Colors.grey),
                                ),
                              );
                            },
                          );
                        }),
                      ],
                    );
                  }),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDraggableCard(String data) {
    return Draggable<String>(
      data: data,
      feedback: Material(
        elevation: 4.0,
        child: Container(
          padding: const EdgeInsets.all(8.0),
          color: Colors.blueAccent,
          child: Text(data, style: const TextStyle(color: Colors.white)),
        ),
      ),
      childWhenDragging: Container(
        margin: const EdgeInsets.all(8.0),
        padding: const EdgeInsets.all(16.0),
        color: Colors.grey[300],
        child: Text(data),
      ),
      child: Container(
        margin: const EdgeInsets.all(8.0),
        padding: const EdgeInsets.all(16.0),
        color: Colors.blue[100],
        child: Text(data),
      ),
    );
  }
}
