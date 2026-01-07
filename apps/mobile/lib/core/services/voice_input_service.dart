import 'package:easy_localization/easy_localization.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart';

class VoiceInputService {
  static final VoiceInputService _instance = VoiceInputService._internal();
  factory VoiceInputService() => _instance;
  VoiceInputService._internal();

  final SpeechToText _speech = SpeechToText();
  bool _isAvailable = false;

  Future<void> init() async {
    // Request permission first
    final status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      _isAvailable = false;
      return;
    }

    // Initialize SpeechToText
    _isAvailable = await _speech.initialize(
      onError: (error) => print('Voice error: $error'),
      onStatus: (status) => print('Voice status: $status'),
    );
  }

  bool get isAvailable => _isAvailable;

  SpeechToText get speech => _speech;

  String getLocaleId(String languageCode) {
    switch (languageCode) {
      case 'hi':
        return 'hi_IN';
      case 'bn':
        return 'bn_BD';
      case 'en':
      default:
        return 'en_US';
    }
  }

  final Map<String, String> supportedVoiceLocales = {
    'English': 'en_US',
    'Hindi': 'hi_IN',
    'Bengali': 'bn_BD',
  };
}
