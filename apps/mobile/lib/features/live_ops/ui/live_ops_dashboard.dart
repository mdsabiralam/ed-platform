import 'package:flutter/material.dart';
import '../models/live_ops_models.dart';
import '../services/live_ops_service.dart';
import 'widgets/school_timeline_row.dart';

class LiveOpsDashboard extends StatefulWidget {
  const LiveOpsDashboard({super.key});

  @override
  State<LiveOpsDashboard> createState() => _LiveOpsDashboardState();
}

class _LiveOpsDashboardState extends State<LiveOpsDashboard> {
  final LiveOpsService _service = LiveOpsService();

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Ops Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Filter logic placeholder
            },
          ),
        ],
      ),
      body: StreamBuilder<List<School>>(
        stream: _service.schoolsStream,
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final schools = snapshot.data!;
          return ListView.builder(
            itemCount: schools.length,
            itemBuilder: (context, index) {
              return SchoolTimelineRow(school: schools[index]);
            },
          );
        },
      ),
    );
  }
}
