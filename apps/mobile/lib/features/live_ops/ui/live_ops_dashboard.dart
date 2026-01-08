import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/live_ops/data/live_ops_service.dart';
import 'package:mobile/features/live_ops/models/school_status.dart';

class LiveOpsDashboard extends StatefulWidget {
  const LiveOpsDashboard({super.key});

  @override
  State<LiveOpsDashboard> createState() => _LiveOpsDashboardState();
}

class _LiveOpsDashboardState extends State<LiveOpsDashboard> {
  final LiveOpsService _service = LiveOpsService();

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LiveOps Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Placeholder for filter
            },
          ),
        ],
      ),
      body: StreamBuilder<List<SchoolStatus>>(
        stream: _service.getLiveStatus(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final schools = snapshot.data!;

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: schools.length,
            separatorBuilder: (context, index) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              return SchoolRow(
                school: schools[index],
              );
            },
          );
        },
      ),
    );
  }
}

class SchoolRow extends StatelessWidget {
  final SchoolStatus school;

  const SchoolRow({
    super.key,
    required this.school,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              school.name,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: school.slots.map((slot) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ClassSlotBlock(slot: slot),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class ClassSlotBlock extends StatefulWidget {
  final ClassSlot slot;

  const ClassSlotBlock({super.key, required this.slot});

  @override
  State<ClassSlotBlock> createState() => _ClassSlotBlockState();
}

class _ClassSlotBlockState extends State<ClassSlotBlock> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Color?> _colorAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _colorAnimation = ColorTween(
      begin: Colors.orange,
      end: Colors.orange.shade200,
    ).animate(_controller);

    if (widget.slot.status == SlotStatus.conciergeRequested) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(ClassSlotBlock oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.slot.status != oldWidget.slot.status) {
      if (widget.slot.status == SlotStatus.conciergeRequested) {
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

  Color _getSlotColor() {
    switch (widget.slot.status) {
      case SlotStatus.active:
        return Colors.green;
      case SlotStatus.conciergeRequested:
        return Colors.orange; // Handled by animation
      case SlotStatus.normal:
      default:
        return Colors.grey.shade300;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('h:mm a');

    return GestureDetector(
      onTap: () {
        final overlay = Overlay.of(context);
        final renderBox = context.findRenderObject() as RenderBox;
        final size = renderBox.size;
        final offset = renderBox.localToGlobal(Offset.zero);

        late OverlayEntry entry;
        entry = OverlayEntry(
          builder: (context) => Stack(
            children: [
              Positioned.fill(
                child: GestureDetector(
                  onTap: () => entry.remove(),
                  behavior: HitTestBehavior.opaque,
                  child: Container(color: Colors.transparent),
                ),
              ),
              Positioned(
                left: offset.dx,
                top: offset.dy + size.height,
                child: Material(
                  elevation: 4,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    width: 200,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Teacher: ${widget.slot.teacherName}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Subject: ${widget.slot.subject}'),
                        const SizedBox(height: 4),
                        Text(widget.slot.timeRemaining, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                        if (widget.slot.requestStatus != null) ...[
                          const Divider(),
                          Text('Request Status: ${widget.slot.requestStatus}', style: const TextStyle(color: Colors.blue)),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
        overlay.insert(entry);
      },
      child: Tooltip(
        message: '${widget.slot.teacherName}\n${widget.slot.subject}',
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final color = widget.slot.status == SlotStatus.conciergeRequested
                ? _colorAnimation.value
                : _getSlotColor();

            return Container(
              width: 100,
              height: 60,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      dateFormat.format(widget.slot.startTime),
                      style: const TextStyle(fontSize: 10, color: Colors.black54),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.slot.subject,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
