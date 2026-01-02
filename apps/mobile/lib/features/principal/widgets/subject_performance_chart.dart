import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class SubjectAverage {
  final String subject;
  final double average;

  SubjectAverage({required this.subject, required this.average});
}

class SubjectPerformanceChart extends StatelessWidget {
  final List<SubjectAverage> data;

  const SubjectPerformanceChart({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.7,
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        color: Colors.white,
        child: BarChart(
          BarChartData(
            barTouchData: BarTouchData(
              enabled: true,
              touchTooltipData: BarTouchTooltipData(
                getTooltipItem: (group, groupIndex, rod, rodIndex) {
                  return BarTooltipItem(
                    rod.toY.toStringAsFixed(1),
                     const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ),
            titlesData: FlTitlesData(
              show: true,
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (double value, TitleMeta meta) {
                    final index = value.toInt();
                    if (index >= 0 && index < data.length) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          data[index].subject,
                          style: const TextStyle(
                            color: Color(0xff7589a2),
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),
              ),
              leftTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
              topTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
              rightTitles: AxisTitles(
                sideTitles: SideTitles(showTitles: false),
              ),
            ),
            borderData: FlBorderData(
              show: false,
            ),
            barGroups: data.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              return BarChartGroupData(
                x: index,
                barRods: [
                  BarChartRodData(
                    toY: item.average,
                    color: _getColor(item.average),
                    width: 16,
                    borderRadius: BorderRadius.circular(4),
                  )
                ],
              );
            }).toList(),
            gridData: FlGridData(show: false),
            alignment: BarChartAlignment.spaceAround,
            maxY: 100,
          ),
        ),
      ),
    );
  }

  Color _getColor(double average) {
    if (average < 40) {
      return Colors.red;
    } else if (average > 75) {
      return Colors.green;
    } else {
      return Colors.yellow;
    }
  }
}
