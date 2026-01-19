import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class PlanListScreen extends StatelessWidget {
  const PlanListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscription Plans'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/super-admin/plans/manage'),
          ),
        ],
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
    return ListView.builder(
      itemCount: 3,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final isPremium = index == 0;
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Container(
            decoration: isPremium
                ? BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.amber.shade700, Colors.amber.shade400],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  )
                : null,
            child: ListTile(
              contentPadding: const EdgeInsets.all(16),
              title: Text(
                index == 0 ? 'Gold Plan' : 'Standard Plan',
                style: TextStyle(
                  color: isPremium ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              subtitle: Text(
                '\$${(index + 1) * 29}/mo',
                style: TextStyle(
                  color: isPremium ? Colors.white70 : Colors.grey.shade700,
                  fontSize: 16,
                ),
              ),
              trailing: Switch(
                value: true,
                onChanged: (val) {},
                activeColor: isPremium ? Colors.white : Colors.blue,
              ),
              onTap: () => context.go('/super-admin/plans/edit/${index + 1}'),
            ),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Card(
        child: SizedBox(
          width: double.infinity,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Plan Name')),
              DataColumn(label: Text('Price')),
              DataColumn(label: Text('Interval')),
              DataColumn(label: Text('Active Subscribers')),
              DataColumn(label: Text('Status')),
              DataColumn(label: Text('Actions')),
            ],
            rows: List.generate(3, (index) {
              return DataRow(
                cells: [
                  DataCell(Text(index == 0 ? 'Gold' : 'Standard')),
                  DataCell(Text('\$${(index + 1) * 29}')),
                  const DataCell(Text('Monthly')),
                  DataCell(Text('${index * 50 + 10}')),
                  DataCell(Switch(value: true, onChanged: (val) {})),
                  DataCell(
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => context.go('/super-admin/plans/edit/${index + 1}'),
                    ),
                  ),
                ],
              );
            }),
          ),
        ),
      ),
    );
  }
}
