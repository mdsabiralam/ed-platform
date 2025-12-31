import 'package:mobile/features/subject_manager/presentation/bloc/subject_bloc.dart';
import 'package:mobile/features/subject_manager/presentation/bloc/subject_state.dart';
import 'package:mobile/features/subject_manager/presentation/widgets/assign_subject_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SubjectManagerScreen extends StatelessWidget {
  const SubjectManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subject Manager')),
      body: BlocConsumer<SubjectBloc, SubjectState>(
        listener: (context, state) {
          if (state is SubjectError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is SubjectAssigned) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Subject assigned successfully'),
                backgroundColor: Colors.green,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is SubjectLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is SubjectLoaded) {
            return ListView.builder(
              itemCount: state.subjects.length,
              itemBuilder: (context, index) {
                final subject = state.subjects[index];
                return ListTile(title: Text(subject));
              },
            );
          } else {
            return const Center(child: Text('Something went wrong'));
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (_) => BlocProvider.value(
              value: BlocProvider.of<SubjectBloc>(context),
              child: const AssignSubjectDialog(),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
