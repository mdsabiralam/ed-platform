import 'package:flutter/material.dart';

class MarksheetBuilderScreen extends StatefulWidget {
  const MarksheetBuilderScreen({super.key});

  @override
  State<MarksheetBuilderScreen> createState() => _MarksheetBuilderScreenState();
}

class _MarksheetBuilderScreenState extends State<MarksheetBuilderScreen> {
  final List<Map<String, dynamic>> _droppedItems = [];
  final GlobalKey _canvasKey = GlobalKey();

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
                _buildDraggableItem('Principal Signature'),
                _buildDraggableItem('Class Teacher Signature'),
              ],
            ),
          ),

          // Canvas (A4 Ratio ~ 1:1.41)
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1 / 1.414,
                child: DragTarget<String>(
                  key: _canvasKey,
                  onWillAccept: (data) => true,
                  onAcceptWithDetails: (details) {
                    final RenderBox renderBox = _canvasKey.currentContext!.findRenderObject() as RenderBox;
                    final localOffset = renderBox.globalToLocal(details.offset);

                    setState(() {
                       _droppedItems.add({
                         'label': details.data,
                         'offset': localOffset
                       });
                    });
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

                           ..._droppedItems.map((item) {
                             final offset = item['offset'] as Offset;
                             return Positioned(
                               left: offset.dx,
                               top: offset.dy,
                               child: Card(
                                 child: Padding(
                                   padding: const EdgeInsets.all(8.0),
                                   child: Text(item['label']),
                                 ),
                               ),
                             );
                           }).toList(),
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
