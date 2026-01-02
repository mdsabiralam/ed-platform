import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/api_client.dart';
import '../bloc/ai_chat_cubit.dart';
import '../bloc/ai_chat_state.dart';

class AiChatScreen extends StatelessWidget {
  final String studentId;
  final String subjectId;

  const AiChatScreen({
    Key? key,
    required this.studentId,
    required this.subjectId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AiChatCubit(
        apiClient: ApiClient(), // In a real app, inject via GetIt or RepositoryProvider
        studentId: studentId,
        subjectId: subjectId,
      ),
      child: const AiChatView(),
    );
  }
}

class AiChatView extends StatefulWidget {
  const AiChatView({Key? key}) : super(key: key);

  @override
  _AiChatViewState createState() => _AiChatViewState();
}

class _AiChatViewState extends State<AiChatView> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Doubt Solver'),
      ),
      body: Column(
        children: [
          Expanded(
            child: BlocConsumer<AiChatCubit, AiChatState>(
              listener: (context, state) {
                if (state is AiChatError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(state.message)),
                  );
                }
                // Scroll to bottom on new message
                WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
              },
              builder: (context, state) {
                List<AiChatMessage> messages = [];
                bool isLoading = false;

                if (state is AiChatLoading) {
                  messages = state.messages;
                  isLoading = true;
                } else if (state is AiChatLoaded) {
                  messages = state.messages;
                } else if (state is AiChatError) {
                  messages = state.messages;
                }

                if (messages.isEmpty && !isLoading) {
                  return const Center(
                    child: Text('Ask a question to get started!'),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16.0),
                  itemCount: messages.length + (isLoading ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == messages.length) {
                      // Loading indicator at the bottom
                      return const Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 8.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(strokeWidth: 2),
                              SizedBox(width: 8),
                              Text('Thinking...', style: TextStyle(fontStyle: FontStyle.italic)),
                            ],
                          ),
                        ),
                      );
                    }

                    final message = messages[index];
                    final isUser = message.sender == AiChatMessageSender.user;

                    return Align(
                      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 4.0),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                        ),
                        child: Column(
                          crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12.0),
                              decoration: BoxDecoration(
                                color: isUser ? Colors.blueAccent : Colors.grey[300],
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(12),
                                  topRight: const Radius.circular(12),
                                  bottomLeft: isUser ? const Radius.circular(12) : const Radius.circular(0),
                                  bottomRight: isUser ? const Radius.circular(0) : const Radius.circular(12),
                                ),
                              ),
                              child: Text(
                                message.text,
                                style: TextStyle(
                                  color: isUser ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                            if (!isUser && message.sourcePage != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4.0, left: 4.0),
                                child: Chip(
                                  label: Text(
                                    'Source: Page ${message.sourcePage}',
                                    style: const TextStyle(fontSize: 10, color: Colors.white),
                                  ),
                                  backgroundColor: Colors.blueGrey,
                                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  visualDensity: VisualDensity.compact,
                                  padding: EdgeInsets.zero,
                                ),
                              ),
                          ],
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
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type your doubt...',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (value) {
                       context.read<AiChatCubit>().askDoubt(value);
                       _controller.clear();
                    },
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send),
                  color: Colors.blue,
                  onPressed: () {
                    final text = _controller.text;
                    if (text.isNotEmpty) {
                      context.read<AiChatCubit>().askDoubt(text);
                      _controller.clear();
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
