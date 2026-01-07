import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:mobile/core/api_client.dart';
import 'package:mobile/features/concierge/data/concierge_repository.dart';
import 'package:mobile/features/concierge/models/concierge_request.dart';

class StaffJobQueueScreen extends StatefulWidget {
  const StaffJobQueueScreen({super.key});

  @override
  State<StaffJobQueueScreen> createState() => _StaffJobQueueScreenState();
}

class _StaffJobQueueScreenState extends State<StaffJobQueueScreen> {
  late final ConciergeRepository _repository;
  List<ConciergeRequest> _requests = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _repository = ConciergeRepository(ApiClient());
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
      final requests = await _repository.getRequests();
      if (!mounted) return;
      setState(() {
        _requests = requests;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load requests';
        _isLoading = false;
      });
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    return '$hours:$minutes';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Job Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadRequests,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!))
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      columns: const [
                        DataColumn(label: Text('Request ID')),
                        DataColumn(label: Text('Teacher Name')),
                        DataColumn(label: Text('Subject')),
                        DataColumn(label: Text('Instructions')),
                        DataColumn(label: Text('Time Elapsed')),
                        DataColumn(label: Text('Status')),
                        DataColumn(label: Text('Action')),
                      ],
                      rows: _requests.map((request) {
                        final isOverdue = request.isOverdue;
                        return DataRow(
                          cells: [
                            DataCell(Text(request.id)),
                            DataCell(Text(request.teacherName)),
                            DataCell(Text(request.subject)),
                            DataCell(
                              SizedBox(
                                width: 200,
                                child: Text(
                                  request.instructions,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                            DataCell(
                              Row(
                                children: [
                                  Text(_formatDuration(request.timeElapsed)),
                                  if (isOverdue) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.red,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Text(
                                        'Overdue',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            DataCell(Text(request.status)),
                            DataCell(
                              ElevatedButton(
                                onPressed: () {
                                  context.push('/concierge/workbench');
                                },
                                child: const Text('Start Work'),
                              ),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                ),
    );
  }
}
