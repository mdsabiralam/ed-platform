import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// State
abstract class AiChatState extends Equatable {
  const AiChatState();
  @override
  List<Object> get props => [];
}

class AiChatInitial extends AiChatState {}

class AiChatLoading extends AiChatState {}

class AiChatLoaded extends AiChatState {
  final List<Map<String, String>> messages; // {'role': 'user'|'ai', 'content': '...'}

  const AiChatLoaded(this.messages);

  @override
  List<Object> get props => [messages];
}

class AiChatError extends AiChatState {
  final String message;
  const AiChatError(this.message);
  @override
  List<Object> get props => [message];
}

// Cubit
class AiChatCubit extends Cubit<AiChatState> {
  AiChatCubit() : super(AiChatInitial());

  List<Map<String, String>> _messages = [];

  Future<void> sendQuery(String query) async {
    _messages.add({'role': 'user', 'content': query});
    emit(AiChatLoading()); // Trigger loading indicator

    try {
      // Simulate API call to POST /ai/rag-query
      await Future.delayed(const Duration(seconds: 2));

      String aiResponse;
      if (query.toLowerCase().contains('newton')) {
        aiResponse = r"Newton's Third Law states that for every action, there is an equal and opposite reaction. Formula: $$ F_{12} = -F_{21} $$";
      } else if (query.toLowerCase().contains('area')) {
        aiResponse = r"The area of a circle is given by $$ A = \pi r^2 $$";
      } else {
        aiResponse = "I am an AI assistant. I can help with your doubts.";
      }

      _messages.add({'role': 'ai', 'content': aiResponse});
      emit(AiChatLoaded(List.from(_messages)));
    } catch (e) {
      emit(AiChatError("Failed to get response"));
      // Restore messages if needed
      emit(AiChatLoaded(List.from(_messages)));
    }
  }
}
