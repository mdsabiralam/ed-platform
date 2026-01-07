import 'package:flutter/material.dart';

class DraggableComponent extends StatelessWidget {
  final String label;
  final Widget child;
  final Function(Offset) onDragEnd;
  final Function(Size)? onResizeEnd;
  final Offset position;
  final Size size;

  const DraggableComponent({
    Key? key,
    required this.label,
    required this.child,
    required this.onDragEnd,
    required this.position,
    required this.size,
    this.onResizeEnd,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: position.dx,
      top: position.dy,
      width: size.width,
      height: size.height,
      child: Stack(
        children: [
          // Drag Handler (Background)
          GestureDetector(
            onPanUpdate: (details) {
              onDragEnd(position + details.delta);
            },
            child: Container(
              width: size.width,
              height: size.height,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.blueAccent),
                color: Colors.white,
              ),
              child: Stack(
                children: [
                  child,
                  // Drag Icon Top-Right
                  Positioned(
                    right: 4,
                    top: 4,
                    child: Icon(Icons.drag_handle, size: 16),
                  ),
                ],
              ),
            ),
          ),

          // Resize Handler (Bottom-Right)
          if (onResizeEnd != null)
            Positioned(
              right: 0,
              bottom: 0,
              child: GestureDetector(
                onPanUpdate: (details) {
                  onResizeEnd!(Size(
                    (size.width + details.delta.dx).clamp(50.0, 600.0),
                    (size.height + details.delta.dy).clamp(50.0, 800.0),
                  ));
                },
                child: Container(
                  width: 20,
                  height: 20,
                  color: Colors.blueAccent.withOpacity(0.5),
                  child: Icon(Icons.crop_free, size: 14, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
