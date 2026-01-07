import 'package:flutter/material.dart';

class ApprovalQueue extends StatefulWidget {
  const ApprovalQueue({super.key});

  @override
  State<ApprovalQueue> createState() => _ApprovalQueueState();
}

class _ApprovalQueueState extends State<ApprovalQueue> {
  // Mock data
  final List<Map<String, dynamic>> _requests = [
    {
      'id': '1',
      'type': 'Leave Request',
      'name': 'Teacher A',
      'detail': 'Sick Leave - 2 Days',
      'status': 'PENDING'
    },
    {
      'id': '2',
      'type': 'Purchase Order',
      'name': 'Science Dept',
      'detail': 'Lab Equipment - \$500',
      'status': 'PENDING'
    },
  ];

  Future<void> _approve(String id) async {
    // API Call to approve
    debugPrint('Approved $id');
  }

  Future<void> _reject(String id, String reason) async {
    // API Call to reject
    debugPrint('Rejected $id for $reason');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Approval Queue')),
      body: _requests.isEmpty
          ? const Center(child: Text('No pending approvals'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _requests.length,
              itemBuilder: (context, index) {
                final item = _requests[index];
                return Dismissible(
                  key: Key(item['id']),
                  background: Container(
                    color: Colors.green,
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.only(left: 20),
                    child: const Icon(Icons.check, color: Colors.white),
                  ),
                  secondaryBackground: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.close, color: Colors.white),
                  ),
                  confirmDismiss: (direction) async {
                    if (direction == DismissDirection.startToEnd) {
                      // Swipe Right -> Approve
                      await _approve(item['id']);
                      return true;
                    } else {
                      // Swipe Left -> Reject
                      // Prompt for reason
                      final reason = await showDialog<String>(
                        context: context,
                        builder: (context) {
                          String reasonText = '';
                          return AlertDialog(
                            title: const Text('Rejection Reason'),
                            content: TextField(
                              onChanged: (val) => reasonText = val,
                              decoration: const InputDecoration(
                                hintText: 'Enter reason...',
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(context, reasonText),
                                child: const Text('Reject'),
                              ),
                            ],
                          );
                        },
                      );

                      if (reason != null && reason.isNotEmpty) {
                        await _reject(item['id'], reason);
                        return true;
                      }
                      return false;
                    }
                  },
                  onDismissed: (direction) {
                    setState(() {
                      _requests.removeAt(index);
                    });
                  },
                  child: Card(
                    child: ListTile(
                      leading: Icon(
                        item['type'] == 'Leave Request'
                            ? Icons.person_off
                            : Icons.shopping_cart,
                      ),
                      title: Text(item['name']),
                      subtitle: Text(item['detail']),
                      trailing: const Icon(Icons.chevron_right),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
