import 'package:equatable/equatable.dart';

enum AiChatMessageSender { user, ai }

class AiChatMessage extends Equatable {
  final String text;
  final AiChatMessageSender sender;
  final DateTime timestamp;
  final int? sourcePage;
  final String? interactionId;
  final bool? isHelpful; // null = no feedback, true = up, false = down

  const AiChatMessage({
    required this.text,
    required this.sender,
    required this.timestamp,
    this.sourcePage,
    this.interactionId,
    this.isHelpful,
  });

  AiChatMessage copyWith({
    String? text,
    AiChatMessageSender? sender,
    DateTime? timestamp,
    int? sourcePage,
    String? interactionId,
    bool? isHelpful,
  }) {
    return AiChatMessage(
      text: text ?? this.text,
      sender: sender ?? this.sender,
      timestamp: timestamp ?? this.timestamp,
      sourcePage: sourcePage ?? this.sourcePage,
      interactionId: interactionId ?? this.interactionId,
      isHelpful: isHelpful ?? this.isHelpful,
    );
  }

  @override
  List<Object?> get props => [text, sender, timestamp, sourcePage, interactionId, isHelpful];
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
