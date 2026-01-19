import 'package:flutter/material.dart';

class PlatformUserManagementScreen extends StatelessWidget {
  const PlatformUserManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Platform Admins'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () => _showInviteDialog(context),
            tooltip: 'Invite Admin',
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

  void _showInviteDialog(BuildContext context) {
    final emailController = TextEditingController();
    String role = 'Support Staff';

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Invite Admin'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Email Address'),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: role,
                decoration: const InputDecoration(labelText: 'Role'),
                items: ['Super Admin', 'Support Staff']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) => role = val!,
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                // API Call
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invitation Sent')));
              },
              child: const Text('Send Invite'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        final isSuperAdmin = index == 0;
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: CircleAvatar(child: Text(isSuperAdmin ? 'SA' : 'S')),
            title: Text(isSuperAdmin ? 'Super Admin User' : 'Support User $index'),
            subtitle: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSuperAdmin ? Colors.purple.shade100 : Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    isSuperAdmin ? 'Super Admin' : 'Support Staff',
                    style: TextStyle(
                      fontSize: 10,
                      color: isSuperAdmin ? Colors.purple : Colors.blue,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(index == 1 ? 'Invited' : 'Active', style: TextStyle(color: index == 1 ? Colors.orange : Colors.green)),
              ],
            ),
            trailing: PopupMenuButton(
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'revoke', child: Text('Revoke Access', style: TextStyle(color: Colors.red))),
              ],
              onSelected: (val) {},
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
              DataColumn(label: Text('Avatar')),
              DataColumn(label: Text('Name')),
              DataColumn(label: Text('Email')),
              DataColumn(label: Text('Role')),
              DataColumn(label: Text('Status')),
              DataColumn(label: Text('Last Login')),
              DataColumn(label: Text('Actions')),
            ],
            rows: List.generate(5, (index) {
              final isSuperAdmin = index == 0;
              return DataRow(
                cells: [
                  DataCell(CircleAvatar(radius: 16, child: Text(isSuperAdmin ? 'SA' : 'S', style: const TextStyle(fontSize: 12)))),
                  DataCell(Text(isSuperAdmin ? 'Super Admin User' : 'Support User $index')),
                  DataCell(Text('user$index@platform.com')),
                  DataCell(
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isSuperAdmin ? Colors.purple.shade100 : Colors.blue.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        isSuperAdmin ? 'Super Admin' : 'Support Staff',
                        style: TextStyle(color: isSuperAdmin ? Colors.purple : Colors.blue),
                      ),
                    ),
                  ),
                  DataCell(Text(index == 1 ? 'Invited' : 'Active', style: TextStyle(color: index == 1 ? Colors.orange : Colors.green))),
                  const DataCell(Text('2023-10-24 10:00 AM')),
                  DataCell(
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {},
                      tooltip: 'Revoke Access',
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
