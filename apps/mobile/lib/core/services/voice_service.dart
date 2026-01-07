import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:permission_handler/permission_handler.dart';

class VoiceService {
  final Record _audioRecorder = Record();
  final SpeechToText _speechToText = SpeechToText();
  bool _isSpeechInitialized = false;

  // AI Engine URL (Using 10.0.2.2 for Android Emulator access to localhost)
  static const String _baseUrl = 'http://10.0.2.2:8000';

  Future<void> init() async {
    // Initialize Speech to Text
    _isSpeechInitialized = await _speechToText.initialize();
  }

  // --- Voice Typing (On-Device) ---

  Future<bool> startListening(Function(String) onResult) async {
    if (!_isSpeechInitialized) {
      await init();
    }

    if (_isSpeechInitialized) {
      await _speechToText.listen(onResult: (result) {
        onResult(result.recognizedWords);
      });
      return true;
    }
    return false;
  }

  Future<void> stopListening() async {
    await _speechToText.stop();
  }

  // --- Voice Command (Server-Side) ---

  Future<void> startRecording() async {
    if (await _audioRecorder.hasPermission()) {
      final directory = await getTemporaryDirectory();
      final path = '${directory.path}/voice_command.wav';

      // Check if file exists and delete it to ensure clean slate
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }

      await _audioRecorder.start(
        path: path,
        encoder: AudioEncoder.wav, // WAV for better compatibility with Whisper
      );
    }
  }

  Future<String?> stopRecordingAndSend() async {
    final path = await _audioRecorder.stop();

    if (path != null) {
      return await _sendAudioToApi(File(path));
    }
    return null;
  }

  Future<String?> _sendAudioToApi(File audioFile) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$_baseUrl/ai/voice/command'),
      );

      request.files.add(
        await http.MultipartFile.fromPath('file', audioFile.path),
      );

      var response = await request.send();

      if (response.statusCode == 200) {
        final respStr = await response.stream.bytesToString();
        return respStr; // Returns JSON string with intent/redirectUrl
      } else {
        print('Voice Command Error: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Voice Command Exception: $e');
      return null;
    }
  }

  Future<bool> checkPermission() async {
    var status = await Permission.microphone.status;
    if (!status.isGranted) {
      status = await Permission.microphone.request();
    }
    return status.isGranted;
  }
}
