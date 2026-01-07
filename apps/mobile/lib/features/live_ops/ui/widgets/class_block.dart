import 'package:flutter/material.dart';
import '../../models/live_ops_models.dart';

class ClassBlock extends StatefulWidget {
  final ClassSession session;

  const ClassBlock({super.key, required this.session});

  @override
  State<ClassBlock> createState() => _ClassBlockState();
}

class _ClassBlockState extends State<ClassBlock> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );

    if (widget.session.hasConciergeRequest) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(ClassBlock oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.session.hasConciergeRequest != oldWidget.session.hasConciergeRequest) {
      if (widget.session.hasConciergeRequest) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
        _controller.reset();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color baseColor;
    if (widget.session.status == ClassStatus.active) {
      baseColor = Colors.green;
    } else if (widget.session.status == ClassStatus.completed) {
      baseColor = Colors.grey;
    } else {
      baseColor = Colors.grey.shade300;
    }

    return Tooltip(
      message: '${widget.session.teacherName}\n${widget.session.subject}\nRemaining: ${widget.session.timeRemaining.inMinutes} mins',
      child: InkWell(
        onTap: () {
          _showDetailsDialog(context);
        },
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            Color color = baseColor;
            if (widget.session.hasConciergeRequest) {
              // Blinking Orange
              color = Color.lerp(Colors.orange, Colors.orange.shade100, _controller.value)!;
            }
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2.0),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Center(
                child: Text(
                  widget.session.subject.substring(0, 1),
                  style: const TextStyle(color: Colors.white, fontSize: 10),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _showDetailsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(widget.session.className),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Teacher: ${widget.session.teacherName}'),
            Text('Subject: ${widget.session.subject}'),
            Text('Status: ${widget.session.status.name}'),
            if (widget.session.hasConciergeRequest)
              const Text('⚠️ Concierge Request Pending!', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}
