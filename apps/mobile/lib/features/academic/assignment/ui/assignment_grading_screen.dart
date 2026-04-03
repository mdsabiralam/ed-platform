import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import '../logic/assignment_grading_cubit.dart';
import '../logic/assignment_grading_state.dart';

class AssignmentGradingScreen extends StatelessWidget {
  final String submissionId;

  const AssignmentGradingScreen({Key? key, required this.submissionId})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AssignmentGradingCubit(
        // Assuming RepositoryProvider or GetIt is used for DI up the tree,
        // but since this is a snippet, we might need to access it via context or constructor.
        // For now, assume it's available via context.read or passed explicitly if we modify the call site.
        // Here we assume context.read<AssignmentRepository>() works if provided globally,
        // otherwise we'd need to inject it. I'll rely on global provider for now.
        RepositoryProvider.of(context),
      )..loadSubmission(submissionId),
      child: const _AssignmentGradingView(),
    );
  }
}

class _AssignmentGradingView extends StatefulWidget {
  const _AssignmentGradingView({Key? key}) : super(key: key);

  @override
  State<_AssignmentGradingView> createState() => _AssignmentGradingViewState();
}

class _AssignmentGradingViewState extends State<_AssignmentGradingView> {
  final TextEditingController _feedbackController = TextEditingController();
  final TextEditingController _marksController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Grade Assignment'),
        actions: [
          BlocBuilder<AssignmentGradingCubit, AssignmentGradingState>(
            builder: (context, state) {
              if (state is AssignmentGradingLoaded) {
                return IconButton(
                  icon: Icon(
                    state.isDrawingMode ? Icons.edit_off : Icons.edit,
                    color: state.isDrawingMode ? Colors.red : null,
                  ),
                  onPressed: () {
                    context.read<AssignmentGradingCubit>().toggleDrawingMode();
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () {
              // Trigger Save
              if (_marksController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter marks')),
                );
                return;
              }
               context.read<AssignmentGradingCubit>().saveGrading(
                    teacherFeedback: _feedbackController.text,
                    obtainedMarks: double.tryParse(_marksController.text) ?? 0.0,
                  );
            },
          ),
        ],
      ),
      body: BlocConsumer<AssignmentGradingCubit, AssignmentGradingState>(
        listener: (context, state) {
           if (state is AssignmentGradingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          if (state is AssignmentGradingLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is AssignmentGradingLoaded) {
            return Column(
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      // PDF Viewer
                      if (state.submission.fileUrl != null)
                        SfPdfViewer.network(
                          state.submission.fileUrl!,
                          canShowScrollHead: false,
                          canShowScrollStatus: false,
                        )
                      else
                        const Center(child: Text('No PDF file submitted')),

                      // Annotation Layer (Simple Overlay for visual feedback)
                      if (state.isDrawingMode)
                        GestureDetector(
                          onTapUp: (details) {
                            // Add a visual marker (e.g., Red Tick or Circle)
                            context.read<AssignmentGradingCubit>().addAnnotation({
                              'type': 'point',
                              'x': details.localPosition.dx,
                              'y': details.localPosition.dy,
                              'page': 1 // Simplified: assuming single page or finding current page
                            });
                          },
                          child: CustomPaint(
                            size: Size.infinite,
                            painter: _AnnotationPainter(state.annotations),
                          ),
                        )
                      else
                         IgnorePointer(
                           child: CustomPaint(
                            size: Size.infinite,
                            painter: _AnnotationPainter(state.annotations),
                          ),
                         ),
                    ],
                  ),
                ),
                // Controls
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.grey[100],
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _marksController,
                              decoration: const InputDecoration(
                                labelText: 'Marks',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 16),
                          // Voice Feedback
                          IconButton(
                            icon: Icon(
                              state.isRecording ? Icons.stop : Icons.mic,
                              color: state.isRecording ? Colors.red : Colors.blue,
                            ),
                            onPressed: () {
                              if (state.isRecording) {
                                context.read<AssignmentGradingCubit>().stopRecording();
                              } else {
                                context.read<AssignmentGradingCubit>().startRecording();
                              }
                            },
                          ),
                          if (state.recordedFilePath != null)
                            IconButton(
                              icon: Icon(
                                state.isPlaying ? Icons.stop_circle : Icons.play_arrow,
                              ),
                              onPressed: () {
                                if (state.isPlaying) {
                                  context.read<AssignmentGradingCubit>().stopPlayback();
                                } else {
                                  context.read<AssignmentGradingCubit>().playRecording();
                                }
                              },
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _feedbackController,
                        decoration: const InputDecoration(
                          labelText: 'Teacher Feedback',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),
              ],
            );
          }
          return const Center(child: Text('Something went wrong'));
        },
      ),
    );
  }
}

class _AnnotationPainter extends CustomPainter {
  final List<Map<String, dynamic>> annotations;

  _AnnotationPainter(this.annotations);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.red
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    for (var annotation in annotations) {
       // Draw a circle at the tap position
       if (annotation['x'] != null && annotation['y'] != null) {
          canvas.drawCircle(Offset(annotation['x'], annotation['y']), 20, paint);
          // Draw a checkmark inside? Simplified to just circle for now.
       }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
