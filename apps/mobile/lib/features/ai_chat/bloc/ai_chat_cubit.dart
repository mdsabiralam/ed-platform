import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:dio/dio.dart';
import '../../../core/api_client.dart';
import 'ai_chat_state.dart';

class AiChatCubit extends Cubit<AiChatState> {
  final ApiClient _apiClient;
  final String _studentId;
  final String _subjectId;

  AiChatCubit({
    required ApiClient apiClient,
    required String studentId,
    required String subjectId,
  })  : _apiClient = apiClient,
        _studentId = studentId,
        _subjectId = subjectId,
        super(AiChatInitial());

  List<AiChatMessage> _currentMessages = [];

  Future<void> askDoubt(String question) async {
    if (question.trim().isEmpty) return;

    _currentMessages = List.from(_currentMessages)
      ..add(AiChatMessage(
        text: question,
        sender: AiChatMessageSender.user,
        timestamp: DateTime.now(),
      ));

    emit(AiChatLoading(_currentMessages));

    try {
      final response = await _apiClient.dio.post(
        '/ai/doubt',
        data: {
          'studentId': _studentId,
          'subjectId': _subjectId,
          'question': question,
        },
      );

      final data = response.data;
      final String answer = data['answer'] ?? "Sorry, I couldn't generate an answer.";
      final int? sourcePage = data['sourcePage'];
      final String? interactionId = data['interactionId'];

      _currentMessages = List.from(_currentMessages)
        ..add(AiChatMessage(
          text: answer,
          sender: AiChatMessageSender.ai,
          timestamp: DateTime.now(),
          sourcePage: sourcePage,
          interactionId: interactionId,
        ));

      emit(AiChatLoaded(_currentMessages));
    } catch (e) {
      String errorMessage = 'Failed to get answer';
      if (e is DioException) {
        if (e.response?.statusCode == 429) {
          errorMessage = 'Daily limit reached. Upgrade to Gold for more queries!';
        } else {
          errorMessage = e.message ?? 'Network error';
        }
      }
      emit(AiChatError(errorMessage, _currentMessages));
    }
  }

  Future<void> submitFeedback(String interactionId, bool isHelpful) async {
    try {
      await _apiClient.dio.post(
        '/ai/feedback',
        data: {
          'interactionId': interactionId,
          'isHelpful': isHelpful,
        },
      );

      // Update local message state to reflect feedback given
      final index = _currentMessages.indexWhere((m) => m.interactionId == interactionId);
      if (index != -1) {
        _currentMessages[index] = _currentMessages[index].copyWith(isHelpful: isHelpful);
        emit(AiChatLoaded(List.from(_currentMessages)));
      }
    } catch (e) {
      // Silently fail or show toast - feedback is non-critical
      print('Feedback submission failed: $e');
    }
  }
}
