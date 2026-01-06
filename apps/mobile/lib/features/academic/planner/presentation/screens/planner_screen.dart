import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:mobile/features/academic/planner/models/lesson_plan.dart';
import 'package:mobile/features/academic/planner/data/planner_service.dart';
import 'package:url_launcher/url_launcher.dart';

class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  final PlannerService _service = PlannerService();

  List<LessonPlan> _selectedPlans = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _selectedDay = _focusedDay;
    _fetchPlans(_selectedDay!);
  }

  Future<void> _fetchPlans(DateTime date) async {
    setState(() => _isLoading = true);
    try {
      final plans = await _service.getPlansForDate(date);
      setState(() => _selectedPlans = plans);
    } catch (e) {
      // Handle error
      print(e);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Teacher Planner')),
      body: Column(
        children: [
          TableCalendar(
            firstDay: DateTime.utc(2020, 10, 16),
            lastDay: DateTime.utc(2030, 3, 14),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
              _fetchPlans(selectedDay);
            },
            calendarStyle: const CalendarStyle(
              // Custom markers can be added here
            ),
          ),
          const Divider(),
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: _selectedPlans.length,
                  itemBuilder: (context, index) {
                    final plan = _selectedPlans[index];
                    return LessonPlanCard(
                      plan: plan,
                      onMarkDone: () async {
                         await _service.markAsDone(plan.id);
                         _fetchPlans(_selectedDay!); // Refresh
                      },
                      onAttachResource: (url) async {
                         // Logic to add resource
                      },
                    );
                  },
                ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.edit),
        onPressed: () {
          // Edit plan logic
        },
      ),
    );
  }
}

class LessonPlanCard extends StatelessWidget {
  final LessonPlan plan;
  final VoidCallback onMarkDone;
  final Function(String) onAttachResource;

  const LessonPlanCard({
    super.key,
    required this.plan,
    required this.onMarkDone,
    required this.onAttachResource
  });

  Color _getColor() {
    switch (plan.status) {
      case LessonPlanStatus.COMPLETED: return Colors.green.shade100;
      case LessonPlanStatus.PENDING: return Colors.amber.shade100;
      case LessonPlanStatus.OVERDUE: return Colors.red.shade100;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: _getColor(),
      margin: const EdgeInsets.all(8.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(plan.topic, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Text(plan.learningOutcomes),
            const SizedBox(height: 8),
            // Resources
            if (plan.resourcesUrl.isNotEmpty)
              Wrap(
                children: plan.resourcesUrl.map((url) => IconButton(
                  icon: const Icon(Icons.link),
                  onPressed: () => launchUrl(Uri.parse(url)),
                )).toList(),
              ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (plan.status != LessonPlanStatus.COMPLETED)
                  ElevatedButton(
                    onPressed: onMarkDone,
                    child: const Text('Mark as Done'),
                  ),
                IconButton(
                   icon: const Icon(Icons.attach_file),
                   onPressed: () {
                      // Show dialog to input URL
                   },
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}
