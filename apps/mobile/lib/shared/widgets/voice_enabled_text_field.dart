import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/services/voice_input_service.dart';

class VoiceEnabledTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? hintText;

  const VoiceEnabledTextField({
    super.key,
    required this.controller,
    this.hintText,
  });

  @override
  State<VoiceEnabledTextField> createState() => _VoiceEnabledTextFieldState();
}

class _VoiceEnabledTextFieldState extends State<VoiceEnabledTextField> {
  final VoiceInputService _voiceService = VoiceInputService();
  bool _isListening = false;
  String _currentVoiceLocaleId = 'en_US';
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _voiceService.init();
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _startListening() async {
    // Permission check handled in Service or explicitly here?
    // Plan says: Update VoiceInputService to use permission_handler
    // But init() is async. We should probably wait for it or check availability.
    // Assuming init() was called in initState, but permissions might need request.

    // We will update VoiceInputService to handle permissions in init() or expose requestPermission().
    // For now, let's assume init() does it or we call a new method.
    // Let's defer permission call to _voiceService for now, as I will update that file next.

    if (!_voiceService.isAvailable) {
       // Try to initialize again or request permission if not available?
       // For now, just show snackbar as per logic.
       // But wait, if permissions are denied, isAvailable might be false.
       await _voiceService.init(); // Retry init which will request permissions
    }

    if (!_voiceService.isAvailable) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Voice input not available')),
        );
      }
      return;
    }

    // Locale-Aware Logic
    if (!mounted) return;
    final String currentLang = context.locale.languageCode;
    String mappedLocaleId = _voiceService.getLocaleId(currentLang);
    _currentVoiceLocaleId = mappedLocaleId;

    setState(() {
      _isListening = true;
    });

    _listen();

    // Show listening overlay
    showModalBottomSheet(
      context: context,
      isDismissible: true, // Allow user to dismiss by tapping outside/swiping
      builder: (context) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Container(
              padding: const EdgeInsets.all(20),
              height: 250,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.mic, size: 50, color: Colors.blue),
                  const SizedBox(height: 20),
                  Text(
                    'voice_hint'.tr(),
                    style: const TextStyle(fontSize: 18),
                  ),
                  const SizedBox(height: 10),
                  DropdownButton<String>(
                    value: _voiceService.supportedVoiceLocales.values
                            .contains(_currentVoiceLocaleId)
                        ? _currentVoiceLocaleId
                        : 'en_US',
                    items: _voiceService.supportedVoiceLocales.entries
                        .map((entry) => DropdownMenuItem(
                              value: entry.value,
                              child: Text(entry.key),
                            ))
                        .toList(),
                    onChanged: (String? newValue) {
                      if (newValue != null && newValue != _currentVoiceLocaleId) {
                        setModalState(() {
                          _currentVoiceLocaleId = newValue;
                        });
                        // Restart listening with new locale
                        _restartListening();
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      _stopListening(); // Stop speech
                      Navigator.pop(context); // Manually close sheet
                    },
                    child: const Text('Stop'),
                  ),
                ],
              ),
            );
          },
        );
      },
    ).whenComplete(() {
      // If sheet is closed (swiped or popped), stop listening if still active
      if (_isListening) {
        _stopListening(shouldPop: false);
      }
    });
  }

  Future<void> _listen() async {
    try {
      await _voiceService.speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            String currentText = widget.controller.text;
            if (currentText.isNotEmpty) {
              widget.controller.text = '$currentText ${result.recognizedWords}';
            } else {
              widget.controller.text = result.recognizedWords;
            }
            // Auto-stop on final result
            if (mounted && _isListening) {
               _stopListening(shouldPop: true); // Close sheet on success
            }
          }
        },
        localeId: _currentVoiceLocaleId,
        cancelOnError: true,
        listenMode: 0,
      );
    } catch (e) {
      _handleError(e);
    }
  }

  void _restartListening() async {
    await _voiceService.speech.stop();
    await Future.delayed(const Duration(milliseconds: 100));
    if (mounted && _isListening) {
        _listen();
    }
  }

  void _stopListening({bool shouldPop = false}) async {
    await _voiceService.speech.stop();
    if (mounted) {
      setState(() {
        _isListening = false;
      });
    }
    // Only pop if requested and if we can pop
    if (shouldPop && Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  void _handleError(dynamic error) {
    // If error occurs, stop listening and close sheet
    _stopListening(shouldPop: true);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Voice input failed')),
      );
      // Focus text field to pop up keyboard
      _focusNode.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: widget.controller,
      focusNode: _focusNode,
      decoration: InputDecoration(
        hintText: widget.hintText,
        suffixIcon: IconButton(
          icon: Icon(_isListening ? Icons.mic_off : Icons.mic),
          onPressed: _startListening,
        ),
        border: const OutlineInputBorder(),
      ),
    );
  }
}
