import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LeaveApplicationScreen extends StatelessWidget {
  const LeaveApplicationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Management'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showApplyLeaveModal(context),
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add),
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
    return Column(
      children: [
        _buildBalanceCards(),
        const Expanded(child: _LeaveHistoryList()),
      ],
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 4,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                _buildBalanceCards(),
                const SizedBox(height: 32),
                const Text('Apply New Leave', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _ApplyLeaveForm(), // Embedded form for Web
              ],
            ),
          ),
        ),
        const VerticalDivider(width: 1),
        const Expanded(
          flex: 6,
          child: _LeaveHistoryList(),
        ),
      ],
    );
  }

  Widget _buildBalanceCards() {
    return SizedBox(
      height: 140,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        children: [
          _buildQuotaCard('Casual Leave', 8, 12, Colors.green),
          _buildQuotaCard('Sick Leave', 5, 10, Colors.orange),
          _buildQuotaCard('Earned Leave', 15, 20, Colors.blue),
        ],
      ),
    );
  }

  Widget _buildQuotaCard(String title, int used, int total, Color color) {
    return Container(
      width: 140,
      margin: const EdgeInsets.only(right: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(value: used / total, color: color, backgroundColor: Colors.white),
              Text('${total - used}', style: TextStyle(fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
          Text('$used / $total Used', style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  void _showApplyLeaveModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: const _ApplyLeaveForm(),
      ),
    );
  }
}

class _ApplyLeaveForm extends StatefulWidget {
  const _ApplyLeaveForm();

  @override
  State<_ApplyLeaveForm> createState() => _ApplyLeaveFormState();
}

class _ApplyLeaveFormState extends State<_ApplyLeaveForm> {
  DateTime? _startDate;
  DateTime? _endDate;
  final _reasonController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Request Leave', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: 'CL',
            items: ['CL', 'SL', 'PL'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            decoration: const InputDecoration(labelText: 'Leave Type', border: OutlineInputBorder()),
            onChanged: (v) {},
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2025));
                    if (d != null) setState(() => _startDate = d);
                  },
                  child: InputDecorator(decoration: const InputDecoration(labelText: 'From', border: OutlineInputBorder()), child: Text(_startDate?.toString().split(' ')[0] ?? 'Select')),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: InkWell(
                  onTap: () async {
                    final d = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime(2025));
                    if (d != null) setState(() => _endDate = d);
                  },
                  child: InputDecorator(decoration: const InputDecoration(labelText: 'To', border: OutlineInputBorder()), child: Text(_endDate?.toString().split(' ')[0] ?? 'Select')),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Validation / Warning Logic
          if (_startDate != null && _endDate != null)
             Container(
               padding: const EdgeInsets.all(8),
               color: Colors.amber.shade100,
               child: const Text('Warning: This leave triggers auto-substitution request.', style: TextStyle(fontSize: 12, color: Colors.brown)),
             ),
          const SizedBox(height: 16),
          TextField(
            controller: _reasonController,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
               ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave Application Submitted')));
               if(Navigator.canPop(context)) Navigator.pop(context); // Close modal if applicable
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, foregroundColor: Colors.white),
            child: const Text('Submit Request'),
          ),
        ],
      ),
    );
  }
}

class _LeaveHistoryList extends StatelessWidget {
  const _LeaveHistoryList();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        final status = index == 0 ? 'Pending' : (index == 1 ? 'Rejected' : 'Approved');
        Color color;
        switch(status) {
          case 'Approved': color = Colors.green; break;
          case 'Rejected': color = Colors.red; break;
          default: color = Colors.amber;
        }

        return Card(
          child: ListTile(
            title: const Text('Casual Leave (2 Days)'),
            subtitle: const Text('10 Oct - 12 Oct • Personal Work'),
            trailing: Chip(label: Text(status), backgroundColor: color.withOpacity(0.1), labelStyle: TextStyle(color: color)),
          ),
        );
      },
    );
  }
}
