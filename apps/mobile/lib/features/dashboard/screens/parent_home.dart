import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/parent_cubit.dart';

class ParentHome extends StatelessWidget {
  const ParentHome({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ParentCubit()..loadDashboard(),
      child: const ParentHomeView(),
    );
  }
}

class ParentHomeView extends StatelessWidget {
  const ParentHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<ParentCubit, ParentState>(
        builder: (context, state) {
          if (state is ParentLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ParentLoaded) {
            return ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                const SizedBox(height: 16),
                _buildFeeStatusCard(context, state.isFeeDue),
                const SizedBox(height: 16),
                _buildChildSwitcher(context, state.childName),
                const SizedBox(height: 16),
                Text("Live Bus Tracking", style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 8),
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map, size: 48, color: Colors.grey),
                        SizedBox(height: 8),
                        Text("Map Preview Placeholder"),
                      ],
                    ),
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

  Widget _buildFeeStatusCard(BuildContext context, bool isDue) {
    return Card(
      color: isDue ? Colors.red.shade50 : Colors.green.shade50,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: isDue ? Colors.red : Colors.green, width: 2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Icon(
              isDue ? Icons.warning_amber_rounded : Icons.check_circle,
              color: isDue ? Colors.red : Colors.green,
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              isDue ? "Fee Payment Due" : "Fees Paid",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: isDue ? Colors.red.shade900 : Colors.green.shade900,
              ),
            ),
            if (isDue) ...[
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text("Pay Now"),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildChildSwitcher(BuildContext context, String currentChild) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.person)),
        title: Text(currentChild),
        subtitle: const Text("Class 5-B"),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            // Switch child logic
          },
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'Alice', child: Text("Alice")),
            const PopupMenuItem(value: 'Bob', child: Text("Bob")),
          ],
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text("Switch"),
              Icon(Icons.arrow_drop_down),
            ],
          ),
        ),
      ),
    );
  }
}
