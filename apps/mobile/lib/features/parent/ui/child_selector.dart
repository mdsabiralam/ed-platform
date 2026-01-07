import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/parent_cubit.dart';
import '../cubit/parent_state.dart';

class ChildSelector extends StatelessWidget {
  const ChildSelector({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ParentCubit, ParentState>(
      builder: (context, state) {
        if (state is ParentLoaded && state.children.isNotEmpty) {
          final currentChild = state.children.firstWhere(
            (child) => child['id'] == state.currentStudentId,
            orElse: () => state.children.first,
          );

          return DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: state.currentStudentId,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
              dropdownColor: Theme.of(context).primaryColor,
              style: const TextStyle(color: Colors.white, fontSize: 16),
              onChanged: (String? newId) {
                if (newId != null) {
                  context.read<ParentCubit>().switchChild(newId);
                }
              },
              items: state.children.map<DropdownMenuItem<String>>((child) {
                return DropdownMenuItem<String>(
                  value: child['id'] as String,
                  child: Text(child['name'] as String),
                );
              }).toList(),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}
