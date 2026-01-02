import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../logic/class_wall_cubit.dart';
import '../data/assignment_repository.dart';

class ClassWallScreen extends StatelessWidget {
  final String assignmentId;

  const ClassWallScreen({Key? key, required this.assignmentId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ClassWallCubit(
        RepositoryProvider.of<AssignmentRepository>(context),
      )..loadFeaturedSubmissions(assignmentId),
      child: Scaffold(
        appBar: AppBar(title: const Text('Class Wall of Fame')),
        body: BlocBuilder<ClassWallCubit, ClassWallState>(
          builder: (context, state) {
            if (state is ClassWallLoading) {
              return const Center(child: CircularProgressIndicator());
            } else if (state is ClassWallLoaded) {
              if (state.submissions.isEmpty) {
                return const Center(child: Text('No featured works yet!'));
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.submissions.length,
                itemBuilder: (context, index) {
                  final submission = state.submissions[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    elevation: 4,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ListTile(
                          leading: CircleAvatar(
                            child: Text(submission.studentName?[0] ?? '?'),
                          ),
                          title: Text(submission.studentName ?? 'Student'),
                          subtitle: Text('Marks: ${submission.obtainedMarks ?? "-"}'),
                          trailing: const Icon(Icons.star, color: Colors.amber),
                        ),
                        if (submission.content != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Text(
                              submission.content!,
                              style: Theme.of(context).textTheme.bodyMedium,
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        if (submission.fileUrl != null)
                          Container(
                            width: double.infinity,
                            color: Colors.grey[200],
                            padding: const EdgeInsets.all(16),
                            child: const Center(
                              child: Icon(Icons.picture_as_pdf, size: 40, color: Colors.red),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              );
            } else if (state is ClassWallError) {
              return Center(child: Text('Error: ${state.message}'));
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
