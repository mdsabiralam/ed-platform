import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_tex/flutter_tex.dart';
import '../cubit/ai_chat_cubit.dart';

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({Key? key}) : super(key: key);

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final TextEditingController _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AiChatCubit(),
      child: Scaffold(
        appBar: AppBar(title: const Text("Doubt Solver")),
        body: Column(
          children: [
            Expanded(
              child: BlocBuilder<AiChatCubit, AiChatState>(
                builder: (context, state) {
                  if (state is AiChatInitial) {
                    return const Center(child: Text("Ask a question to start!"));
                  }

                  // Use local list if loading to show history
                  List<Map<String, String>> messages = [];
                  bool isLoading = false;

                  if (state is AiChatLoaded) {
                    messages = state.messages;
                  } else if (state is AiChatLoading) {
                     // In a real app we'd access the cubit's current list or maintain it in the widget
                     // For simplicity, we assume the cubit emits the list with loading or we handle it differently.
                     // Here we'll just show a loader at the bottom.
                     isLoading = true;
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: messages.length + (isLoading ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == messages.length) {
                        return const Padding(
                          padding: EdgeInsets.all(8.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Chip(label: Text("Thinking...")),
                          ),
                        );
                      }

                      final msg = messages[index];
                      final isUser = msg['role'] == 'user';

                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isUser ? Colors.blue : Colors.grey[200],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: isUser
                            ? Text(msg['content']!, style: const TextStyle(color: Colors.white))
                            : TeXView(
                                child: TeXViewDocument(msg['content']!),
                                style: const TeXViewStyle(
                                  contentColor: Colors.black,
                                ),
                              ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Builder( // Builder to get context with Cubit
                builder: (context) {
                  return Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          decoration: const InputDecoration(
                            hintText: "Ask a doubt...",
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: () {
                          if (_controller.text.isNotEmpty) {
                            context.read<AiChatCubit>().sendQuery(_controller.text);
                            _controller.clear();
                          }
                        },
                      ),
                    ],
                  );
                }
              ),
            ),
          ],
        ),
      ),
    );
  }
}
