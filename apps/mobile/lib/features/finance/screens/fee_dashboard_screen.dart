import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:go_router/go_router.dart';

class FeeDashboardScreen extends StatelessWidget {
  const FeeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Financial Overview'),
        backgroundColor: Colors.green.shade800,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: () {}, // Date Range Picker
            tooltip: 'This Month',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/finance/collect'), // Quick Collect
        backgroundColor: Colors.green.shade800,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildKPICard('Total Collected', '\$45,200', Colors.green),
          const SizedBox(height: 16),
          _buildKPICard('Total Due', '\$12,500', Colors.redAccent),
          const SizedBox(height: 16),
          _buildKPICard('Expenses', '\$8,000', Colors.orange),
          const SizedBox(height: 24),
          const Align(alignment: Alignment.centerLeft, child: Text('Recent Transactions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          const SizedBox(height: 8),
          _buildRecentTransactionsList(),
        ],
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: _buildKPICard('Total Collected', '\$45,200', Colors.green)),
              const SizedBox(width: 24),
              Expanded(child: _buildKPICard('Total Due', '\$12,500', Colors.redAccent)),
              const SizedBox(width: 24),
              Expanded(child: _buildKPICard('Expenses', '\$8,000', Colors.orange)),
              const SizedBox(width: 24),
              Expanded(child: _buildKPICard('Net Income', '\$37,200', Colors.blue)),
            ],
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 400,
            child: Row(
              children: [
                Expanded(flex: 2, child: _buildBarChart()),
                const SizedBox(width: 24),
                Expanded(child: _buildPieChart()),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const Text('Top Defaulters', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildDefaultersTable(context),
        ],
      ),
    );
  }

  Widget _buildKPICard(String title, String value, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(color: color, fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            // Mock Sparkline
            Container(height: 4, width: 50, color: color.withOpacity(0.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTransactionsList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            leading: const CircleAvatar(backgroundColor: Colors.green, child: Icon(Icons.check, color: Colors.white)),
            title: Text('Student $index'),
            subtitle: const Text('Tuition Fee • Cash'),
            trailing: const Text('+\$500', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
            onTap: () {}, // View Receipt
          ),
        );
      },
    );
  }

  Widget _buildBarChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: BarChart(
          BarChartData(
            barGroups: [
              BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 8, color: Colors.green), BarChartRodData(toY: 2, color: Colors.red)]),
              BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 10, color: Colors.green), BarChartRodData(toY: 3, color: Colors.red)]),
              BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 14, color: Colors.green), BarChartRodData(toY: 1, color: Colors.red)]),
            ],
            titlesData: FlTitlesData(
              bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (val, _) {
                 return Text(['Jan', 'Feb', 'Mar'][val.toInt()]);
              })),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPieChart() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: PieChart(
          PieChartData(
            sections: [
              PieChartSectionData(value: 60, title: 'Tuition', color: Colors.blue),
              PieChartSectionData(value: 20, title: 'Transport', color: Colors.orange),
              PieChartSectionData(value: 20, title: 'Exam', color: Colors.purple),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultersTable(BuildContext context) {
    return Card(
      child: SizedBox(
        width: double.infinity,
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Student')),
            DataColumn(label: Text('Class')),
            DataColumn(label: Text('Due Amount')),
            DataColumn(label: Text('Months')),
            DataColumn(label: Text('Action')),
          ],
          rows: List.generate(3, (index) {
            return DataRow(
              color: MaterialStateProperty.all(Colors.red.shade50),
              cells: [
                DataCell(Text('Defaulter $index')),
                const DataCell(Text('10-A')),
                const DataCell(Text('\$2,500')),
                const DataCell(Text('5')),
                DataCell(
                  ElevatedButton(
                    onPressed: () {}, // Notify
                    child: const Text('Notify'),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
