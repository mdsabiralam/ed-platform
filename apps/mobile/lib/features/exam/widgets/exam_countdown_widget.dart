import 'dart:async';
import 'package:flutter/material.dart';
import '../data/exam_repository.dart';
import '../models/exam_schedule_model.dart';
import 'package:intl/intl.dart';

class ExamCountdownWidget extends StatefulWidget {
  final String classId;
  final ExamRepository examRepository;

  const ExamCountdownWidget({
    Key? key,
    required this.classId,
    required this.examRepository,
  }) : super(key: key);

  @override
  _ExamCountdownWidgetState createState() => _ExamCountdownWidgetState();
}

class _ExamCountdownWidgetState extends State<ExamCountdownWidget> {
  ExamSchedule? _nextExam;
  Timer? _timer;
  Duration _timeLeft = Duration.zero;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_nextExam != null) {
        final now = DateTime.now();
        if (_nextExam!.startTime.isAfter(now)) {
          setState(() {
            _timeLeft = _nextExam!.startTime.difference(now);
          });
        } else {
          // Exam started or passed, refresh to find next one
          _fetchSchedules();
        }
      }
    });
  }

  Future<void> _fetchSchedules() async {
    try {
      final schedules = await widget.examRepository.getExamSchedules(widget.classId);
      final now = DateTime.now();

      // Filter for future exams and sort
      final futureExams = schedules
          .where((exam) => exam.startTime.isAfter(now))
          .toList()
        ..sort((a, b) => a.startTime.compareTo(b.startTime));

      if (mounted) {
        setState(() {
          _nextExam = futureExams.isNotEmpty ? futureExams.first : null;
          if (_nextExam != null) {
            _timeLeft = _nextExam!.startTime.difference(now);
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final days = duration.inDays;
    final hours = twoDigits(duration.inHours.remainder(24));
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));

    if (days > 0) {
      return '$days Days : $hours Hours : $minutes Mins';
    } else {
      return '$hours Hours : $minutes Mins : $seconds Secs';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(child: Text('Error: $_error'));
    }

    if (_nextExam == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('No upcoming exams scheduled.'),
        ),
      );
    }

    final isUrgent = _timeLeft.inHours < 24;
    final textColor = isUrgent ? Colors.red : Colors.black;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Upcoming Exam',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              _nextExam!.subjectName,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              _nextExam!.examName,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isUrgent ? Colors.red.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isUrgent ? Colors.red : Colors.blue,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.timer,
                    color: textColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _formatDuration(_timeLeft),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: textColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text(
                DateFormat('EEEE, MMM d, yyyy • h:mm a').format(_nextExam!.startTime),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
