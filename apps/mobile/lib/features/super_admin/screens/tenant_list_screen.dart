import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TenantListScreen extends StatelessWidget {
  const TenantListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Managed Schools'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/super-admin/tenants/add'),
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
    // Mock Data
    final tenants = List.generate(10, (index) => index);
    return ListView.builder(
      itemCount: tenants.length,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: const CircleAvatar(child: Icon(Icons.school)),
            title: Text('School $index'),
            subtitle: Row(
              children: [
                const Text('Pro Plan'),
                const SizedBox(width: 8),
                const Icon(Icons.circle, size: 8, color: Colors.green),
                const SizedBox(width: 4),
                const Text('Active', style: TextStyle(color: Colors.green)),
              ],
            ),
            onTap: () => context.go('/super-admin/tenants/details/$index'),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    labelText: 'Search by Name',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (value) {
                    // Implement Debounce logic here
                  },
                ),
              ),
              const SizedBox(width: 16),
              DropdownButton<String>(
                value: 'ALL',
                items: const [
                  DropdownMenuItem(value: 'ALL', child: Text('All Status')),
                  DropdownMenuItem(value: 'ACTIVE', child: Text('Active')),
                  DropdownMenuItem(value: 'SUSPENDED', child: Text('Suspended')),
                ],
                onChanged: (val) {},
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Card(
              child: SingleChildScrollView(
                child: SizedBox(
                  width: double.infinity,
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Logo')),
                      DataColumn(label: Text('Name')),
                      DataColumn(label: Text('Domain')),
                      DataColumn(label: Text('Plan')),
                      DataColumn(label: Text('Users')),
                      DataColumn(label: Text('Status')),
                      DataColumn(label: Text('Actions')),
                    ],
                    rows: List.generate(10, (index) {
                      return DataRow(
                        cells: [
                          const DataCell(CircleAvatar(radius: 16, child: Icon(Icons.school, size: 16))),
                          DataCell(Text('School $index')),
                          DataCell(Text('school$index.ed.app')),
                          const DataCell(Text('Pro')),
                          const DataCell(Text('120')),
                          DataCell(
                             Container(
                               padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                               decoration: BoxDecoration(
                                 color: Colors.green.shade100,
                                 borderRadius: BorderRadius.circular(12),
                               ),
                               child: const Text('Active', style: TextStyle(color: Colors.green)),
                             ),
                          ),
                          DataCell(
                            Row(
                              children: [
                                Switch(value: true, onChanged: (val) {}),
                                IconButton(
                                  icon: const Icon(Icons.visibility, color: Colors.grey),
                                  onPressed: () => context.go('/super-admin/tenants/details/$index'),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
