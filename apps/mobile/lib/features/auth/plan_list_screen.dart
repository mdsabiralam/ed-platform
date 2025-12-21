import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/saas/plans_cubit.dart';

class PlanListScreen extends StatelessWidget {
  const PlanListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription Plans')),
      body: BlocBuilder<PlansCubit, PlansState>(
        builder: (context, state) {
          if (state is PlansInitial) {
            context.read<PlansCubit>().loadPlans();
            return const Center(child: CircularProgressIndicator());
          } else if (state is PlansLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is PlansLoaded) {
            return ListView.builder(
              itemCount: state.plans.length,
              itemBuilder: (context, index) {
                final plan = state.plans[index];
                return Card(
                  margin: const EdgeInsets.all(8.0),
                  child: ListTile(
                    title: Text(
                      plan.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(plan.features.join(", ")),
                    trailing: Text(
                      "৳${plan.priceMonthly}",
                      style: const TextStyle(color: Colors.green, fontSize: 16),
                    ),
                  ),
                );
              },
            );
          } else if (state is PlansError) {
            return Center(child: Text('Error: ${state.message}'));
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
