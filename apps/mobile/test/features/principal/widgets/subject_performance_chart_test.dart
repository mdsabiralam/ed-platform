import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/principal/widgets/subject_performance_chart.dart';
import 'package:fl_chart/fl_chart.dart';

void main() {
  testWidgets('SubjectPerformanceChart renders correctly', (WidgetTester tester) async {
    final data = [
      SubjectAverage(subject: 'Math', average: 85.0),
      SubjectAverage(subject: 'Science', average: 30.0),
      SubjectAverage(subject: 'English', average: 50.0),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SubjectPerformanceChart(data: data),
        ),
      ),
    );

    // Verify that the chart widget is present
    expect(find.byType(SubjectPerformanceChart), findsOneWidget);
    expect(find.byType(BarChart), findsOneWidget);
  });
}
