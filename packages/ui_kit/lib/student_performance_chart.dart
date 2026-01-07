import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class SubjectMark {
  final String subject;
  final double mark;
  final double fullMark;

  SubjectMark({
    required this.subject,
    required this.mark,
    required this.fullMark,
  });
}

class StudentPerformanceChart extends StatelessWidget {
  final List<SubjectMark> studentMarks;
  final List<double> classAverages; // Must align with studentMarks subjects

  const StudentPerformanceChart({
    Key? key,
    required this.studentMarks,
    required this.classAverages,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (studentMarks.length != classAverages.length || studentMarks.length < 3) {
      return const Center(child: Text('Insufficient data for Radar Chart (min 3 subjects)'));
    }

    return AspectRatio(
      aspectRatio: 1.3,
      child: RadarChart(
        RadarChartData(
          radarTouchData: RadarTouchData(enabled: true),
          dataSets: [
            RadarDataSet(
              fillColor: Colors.blue.withOpacity(0.4),
              borderColor: Colors.blue,
              entryRadius: 2,
              dataEntries: studentMarks.map((e) => RadarEntry(value: e.mark)).toList(),
              borderWidth: 2,
            ),
            RadarDataSet(
              fillColor: Colors.red.withOpacity(0.4),
              borderColor: Colors.red,
              entryRadius: 2,
              dataEntries: classAverages.map((e) => RadarEntry(value: e)).toList(),
              borderWidth: 2,
            ),
          ],
          radarBackgroundColor: Colors.transparent,
          borderData: FlBorderData(show: false),
          radarBorderData: const BorderSide(color: Colors.black26),
          titlePositionPercentageOffset: 0.2,
          titleTextStyle: const TextStyle(color: Colors.black, fontSize: 12),
          getTitle: (index, angle) {
            if (index < studentMarks.length) {
                return RadarChartTitle(text: studentMarks[index].subject);
            }
             return const RadarChartTitle(text: '');
          },
          tickCount: 5,
          ticksTextStyle: const TextStyle(color: Colors.grey, fontSize: 10),
          tickBorderData: const BorderSide(color: Colors.black12),
          gridBorderData: const BorderSide(color: Colors.black12, width: 2),
        ),
      ),
    );
  }
}
