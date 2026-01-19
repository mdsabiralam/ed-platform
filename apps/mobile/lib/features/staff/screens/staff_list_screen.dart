import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class StaffListScreen extends StatelessWidget {
  const StaffListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Directory'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {}, // Implement Search
          ),
          if (MediaQuery.of(context).size.width > 800)
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: ElevatedButton.icon(
                icon: const Icon(Icons.add),
                label: const Text('Add Staff'),
                onPressed: () => context.go('/staff/add'),
              ),
            ),
        ],
      ),
      floatingActionButton: MediaQuery.of(context).size.width <= 800
          ? FloatingActionButton(
              onPressed: () => context.go('/staff/add'),
              backgroundColor: const Color(0xFF0D47A1),
              child: const Icon(Icons.add),
            )
          : null,
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
    final staffList = List.generate(10, (index) => index);
    return ListView.builder(
      itemCount: staffList.length,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: CircleAvatar(child: Text('S$index')),
            title: Text('Staff Member $index', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Senior Teacher • Mathematics'),
            trailing: IconButton(
              icon: const Icon(Icons.call, color: Colors.green),
              onPressed: () => _makePhoneCall('1234567890'),
            ),
            onTap: () => context.go('/staff/profile/$index'),
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
                    labelText: 'Search Staff',
                    prefixIcon: Icon(Icons.search),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (val) {},
                ),
              ),
              const SizedBox(width: 16),
              DropdownButton<String>(
                value: 'All',
                items: ['All', 'Teacher', 'Admin', 'Driver']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) {},
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: Card(
              child: SizedBox(
                width: double.infinity,
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('ID')),
                    DataColumn(label: Text('Name')),
                    DataColumn(label: Text('Role')),
                    DataColumn(label: Text('Department')),
                    DataColumn(label: Text('Phone')),
                    DataColumn(label: Text('Status')),
                    DataColumn(label: Text('Actions')),
                  ],
                  rows: List.generate(10, (index) {
                    return DataRow(
                      cells: [
                        DataCell(Text('#10$index')),
                        DataCell(
                          Row(
                            children: [
                              CircleAvatar(radius: 12, child: Text('S$index', style: const TextStyle(fontSize: 10))),
                              const SizedBox(width: 8),
                              Text('Staff Member $index'),
                            ],
                          ),
                        ),
                        DataCell(_buildRoleBadge(index % 3)),
                        const DataCell(Text('Science')),
                        const DataCell(Text('123-456-7890')),
                        const DataCell(Text('Active', style: TextStyle(color: Colors.green))),
                        DataCell(
                          IconButton(
                            icon: const Icon(Icons.visibility, color: Colors.grey),
                            onPressed: () => context.go('/staff/profile/$index'),
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleBadge(int type) {
    Color bg;
    String label;
    Color text = Colors.white;

    switch (type) {
      case 0:
        bg = Colors.blue;
        label = 'Teacher';
        break;
      case 1:
        bg = Colors.purple;
        label = 'Admin';
        break;
      default:
        bg = Colors.grey;
        label = 'Driver';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(label, style: TextStyle(color: text, fontSize: 12)),
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }
}
