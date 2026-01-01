import 'package:flutter/material.dart';

class MarksheetBuilderScreen extends StatefulWidget {
  const MarksheetBuilderScreen({super.key});

  @override
  State<MarksheetBuilderScreen> createState() => _MarksheetBuilderScreenState();
}

class _MarksheetBuilderScreenState extends State<MarksheetBuilderScreen> {
  // State to store dropped items. For simplicity, storing label strings.
  final List<String> _droppedItems = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Marksheet Builder')),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 200,
            color: Colors.grey[200],
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text('Components', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                _buildDraggableItem('Header'),
                _buildDraggableItem('Student Info'),
                _buildDraggableItem('Marks Table'),
                _buildDraggableItem('Signature'),
              ],
            ),
          ),

          // Canvas (A4 Ratio ~ 1:1.41)
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1 / 1.414,
                child: DragTarget<String>(
                  onWillAccept: (data) => true,
                  onAccept: (data) {
                    setState(() {
                       _droppedItems.add(data);
                    });
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Added $data')));
                  },
                  builder: (context, candidateData, rejectedData) {
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.black),
                        boxShadow: const [BoxShadow(blurRadius: 5, color: Colors.black12)],
                      ),
                      child: Stack(
                        children: [
                           if (_droppedItems.isEmpty)
                             const Center(child: Text('Drop Here')),
                           // Simple list rendering for demo
                           ListView.builder(
                             itemCount: _droppedItems.length,
                             itemBuilder: (ctx, i) => ListTile(title: Text(_droppedItems[i])),
                           ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDraggableItem(String label) {
    return Draggable<String>(
      data: label,
      feedback: Material(
        elevation: 4.0,
        child: Container(
          padding: const EdgeInsets.all(8),
          color: Colors.blueAccent,
          child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 16)),
        ),
      ),
      childWhenDragging: Card(
        margin: const EdgeInsets.all(8),
        color: Colors.grey[300],
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(label),
        ),
      ),
      child: Card(
        margin: const EdgeInsets.all(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(label),
        ),
      ),
    );
  }
}
