import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/concierge/models/concierge_request.dart';

class StaffJobQueueScreen extends StatefulWidget {
  const StaffJobQueueScreen({super.key});

  @override
  State<StaffJobQueueScreen> createState() => _StaffJobQueueScreenState();
}

class _StaffJobQueueScreenState extends State<StaffJobQueueScreen> {
  List<ConciergeRequest> _requests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    // Mock Data Fetching
    await Future.delayed(const Duration(seconds: 1)); // Simulate API delay

    if (!mounted) return;

    final now = DateTime.now();
    final mockData = [
      ConciergeRequest(
        id: 'REQ-001',
        teacherName: 'John Doe',
        subject: 'Mathematics',
        instructionText: 'Print 50 copies of the attached quiz for Grade 10A.',
        createdAt: now.subtract(const Duration(hours: 3)), // SLA Breach
        status: ConciergeRequestStatus.PENDING,
      ),
      ConciergeRequest(
        id: 'REQ-002',
        teacherName: 'Jane Smith',
        subject: 'Physics',
        instructionText: 'Prepare lab equipment for the optics experiment.',
        createdAt: now.subtract(const Duration(minutes: 45)), // On Track
        status: ConciergeRequestStatus.PENDING,
      ),
      ConciergeRequest(
        id: 'REQ-003',
        teacherName: 'Robert Brown',
        subject: 'History',
        instructionText: 'Digitize the handwritten notes from yesterday.',
        createdAt: now.subtract(const Duration(hours: 1, minutes: 50)), // On Track
        status: ConciergeRequestStatus.PENDING,
      ),
      ConciergeRequest(
        id: 'REQ-004',
        teacherName: 'Emily Davis',
        subject: 'English',
        instructionText: 'Proofread the monthly newsletter draft.',
        createdAt: now.subtract(const Duration(hours: 5)), // SLA Breach
        status: ConciergeRequestStatus.PENDING,
      ),
       ConciergeRequest(
        id: 'REQ-005',
        teacherName: 'Michael Wilson',
        subject: 'Chemistry',
        instructionText: 'Clean up the spillage in the lab.',
        createdAt: now.subtract(const Duration(hours: 2, minutes: 10)), // SLA Breach
        status: ConciergeRequestStatus.COMPLETED, // Should be filtered out
      ),
    ];

    setState(() {
      _requests = mockData
          .where((req) => req.status == ConciergeRequestStatus.PENDING)
          .toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Queue'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                // Determine if we are on a wider screen (e.g. desktop/tablet)
                // However, requirement asks for DataTable or Responsive List View for Desktop Web.
                // We will use SingleChildScrollView with scrollDirection horizontal for small screens if needed,
                // but primarily design for a table structure.

                return SingleChildScrollView(
                  scrollDirection: Axis.vertical,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minWidth: constraints.maxWidth),
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('Request ID')),
                          DataColumn(label: Text('Teacher')),
                          DataColumn(label: Text('Subject')),
                          DataColumn(label: Text('Instructions')),
                          DataColumn(label: Text('Time Elapsed')),
                          DataColumn(label: Text('Action')),
                        ],
                        rows: _requests.map((request) {
                          final timeElapsed = DateTime.now().difference(request.createdAt);
                          final isSlaBreach = timeElapsed.inMinutes > 120;
                          final hours = timeElapsed.inHours;
                          final minutes = timeElapsed.inMinutes % 60;

                          return DataRow(cells: [
                            DataCell(Text(request.id)),
                            DataCell(Text(request.teacherName)),
                            DataCell(Text(request.subject)),
                            DataCell(
                              Tooltip(
                                message: request.instructionText,
                                child: Text(
                                  request.instructionText.length > 30
                                      ? '${request.instructionText.substring(0, 30)}...'
                                      : request.instructionText,
                                ),
                              ),
                            ),
                            DataCell(
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isSlaBreach
                                          ? Colors.red.withOpacity(0.1)
                                          : Colors.green.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSlaBreach
                                            ? Colors.red
                                            : Colors.green,
                                      ),
                                    ),
                                    child: Text(
                                      isSlaBreach ? 'SLA Breach' : 'On Track',
                                      style: TextStyle(
                                        color: isSlaBreach
                                            ? Colors.red
                                            : Colors.green,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text('${hours}h ${minutes}m'),
                                ],
                              ),
                            ),
                            DataCell(
                              ElevatedButton(
                                onPressed: () {
                                  context.push('/staff/workbench/${request.id}');
                                },
                                child: const Text('Start Work'),
                              ),
                            ),
                          ]);
                        }).toList(),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
