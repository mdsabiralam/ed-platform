import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/features/chat/chat_state.dart';
import 'package:mobile/features/chat/models/chat_message.dart';

class ChatCubit extends Cubit<ChatState> {
  ChatCubit() : super(ChatInitial());

  void loadMessages() {
    emit(ChatLoading());
    // Mock data
    final messages = [
      ChatMessage(
        id: '1',
        text: 'Hello! How are you?',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isMe: false,
      ),
      ChatMessage(
        id: '2',
        text: 'I am doing great, thanks for asking!',
        timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
        isMe: true,
        isRead: true,
      ),
    ];
    emit(ChatLoaded(messages: messages));
  }

  void sendMessage(String text) {
    if (state is ChatLoaded) {
      final currentState = state as ChatLoaded;
      final newMessage = ChatMessage(
        id: DateTime.now().toString(),
        text: text,
        timestamp: DateTime.now(),
        isMe: true,
        isSent: false, // Will change to true after delay
      );

      final updatedMessages = List<ChatMessage>.from(currentState.messages)
        ..add(newMessage);

      emit(currentState.copyWith(messages: updatedMessages));

      // Mock sending delay
      Future.delayed(const Duration(seconds: 1), () {
        // Here we would typically update the message status or receive a confirmation
        // For now, we'll just simulate a response after another second
        receiveMockResponse();
      });
    }
  }

  void receiveMockResponse() {
    if (state is ChatLoaded) {
      final currentState = state as ChatLoaded;
      emit(currentState.copyWith(isTyping: true));

      Future.delayed(const Duration(seconds: 3), () {
        if (state is ChatLoaded) { // Check if still loaded
           final loadedState = state as ChatLoaded;
           final responseMessage = ChatMessage(
            id: DateTime.now().toString(),
            text: 'This is a mock response.',
            timestamp: DateTime.now(),
            isMe: false,
          );
           emit(loadedState.copyWith(
             messages: List.from(loadedState.messages)..add(responseMessage),
             isTyping: false,
           ));
        }
      });
    }
  }
}
