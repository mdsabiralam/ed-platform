import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/teacher_cubit.dart';

class TeacherHome extends StatelessWidget {
  const TeacherHome({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => TeacherCubit()..loadDashboard(),
      child: const TeacherHomeView(),
    );
  }
}

class TeacherHomeView extends StatelessWidget {
  const TeacherHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<TeacherCubit, TeacherState>(
        builder: (context, state) {
          if (state is TeacherLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is TeacherLoaded) {
            return CustomScrollView(
              slivers: [
                const SliverAppBar(
                  title: Text("Teacher Dashboard"),
                  floating: true,
                ),
                SliverToBoxAdapter(
                  child: _buildCurrentClassBanner(context, state.currentClass),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverToBoxAdapter(
                    child: Text("Today's Schedule", style: Theme.of(context).textTheme.titleLarge),
                  ),
                ),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 120,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: state.schedule.length,
                      itemBuilder: (context, index) {
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 8.0),
                          child: Container(
                            width: 150,
                            padding: const EdgeInsets.all(16),
                            child: Center(child: Text(state.schedule[index])),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverToBoxAdapter(
                    child: Text("Quick Actions", style: Theme.of(context).textTheme.titleLarge),
                  ),
                ),
                SliverGrid.count(
                  crossAxisCount: 3,
                  children: const [
                    _QuickActionCard(icon: Icons.check_circle_outline, label: "Attendance"),
                    _QuickActionCard(icon: Icons.grade, label: "Marks"),
                    _QuickActionCard(icon: Icons.edit_note, label: "Leave"),
                  ],
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverToBoxAdapter(
                    child: Text("Pending Tasks", style: Theme.of(context).textTheme.titleLarge),
                  ),
                ),
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return const ListTile(
                        leading: Icon(Icons.warning_amber_rounded, color: Colors.orange),
                        title: Text("Leave Request from John Doe"),
                        subtitle: Text("Pending Approval"),
                        trailing: Icon(Icons.arrow_forward_ios, size: 16),
                      );
                    },
                    childCount: state.pendingTasksCount,
                  ),
                ),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildCurrentClassBanner(BuildContext context, String? currentClass) {
    // In a real app, this would be updated via a Stream<DateTime>
    // For now, checking the state variable which simulates the "Time-Based UI"
    if (currentClass != null) {
      return Container(
        color: Colors.blueAccent.withOpacity(0.1),
        padding: const EdgeInsets.all(16.0),
        margin: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            const Icon(Icons.access_time_filled, color: Colors.blue),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Happening Now", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                  Text("Class $currentClass is in session.", style: const TextStyle(fontSize: 16)),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () {},
              child: const Text("Take Attendance"),
            )
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;

  const _QuickActionCard({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: Theme.of(context).primaryColor),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
