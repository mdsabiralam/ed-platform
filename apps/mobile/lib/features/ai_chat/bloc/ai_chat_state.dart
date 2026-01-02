import 'package:equatable/equatable.dart';

enum AiChatMessageSender { user, ai }

class AiChatMessage extends Equatable {
  final String text;
  final AiChatMessageSender sender;
  final DateTime timestamp;
  final int? sourcePage;

  const AiChatMessage({
    required this.text,
    required this.sender,
    required this.timestamp,
    this.sourcePage,
  });

  @override
  List<Object?> get props => [text, sender, timestamp, sourcePage];
}

abstract class AiChatState extends Equatable {
  const AiChatState();

  @override
  List<Object?> get props => [];
}

class AiChatInitial extends AiChatState {}

class AiChatLoading extends AiChatState {
  final List<AiChatMessage> messages;
  const AiChatLoading(this.messages);

  @override
  List<Object?> get props => [messages];
}

class AiChatLoaded extends AiChatState {
  final List<AiChatMessage> messages;
  const AiChatLoaded(this.messages);

  @override
  List<Object?> get props => [messages];
}

class AiChatError extends AiChatState {
  final String message;
  final List<AiChatMessage> messages;
  const AiChatError(this.message, this.messages);

  @override
  List<Object?> get props => [message, messages];
}
