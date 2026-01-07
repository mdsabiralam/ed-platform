import 'dart:async';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';

class SecureVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final String studentId;

  const SecureVideoPlayer({
    Key? key,
    required this.videoUrl,
    required this.studentId,
  }) : super(key: key);

  @override
  _SecureVideoPlayerState createState() => _SecureVideoPlayerState();
}

class _SecureVideoPlayerState extends State<SecureVideoPlayer> with SingleTickerProviderStateMixin {
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;
  late AnimationController _watermarkController;
  late Animation<Offset> _watermarkAnimation;

  @override
  void initState() {
    super.initState();
    _enableSecureMode();
    _initializePlayer();
    _setupWatermarkAnimation();
  }

  Future<void> _enableSecureMode() async {
    try {
      await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
    } catch (e) {
      debugPrint('Error enabling secure mode: $e');
    }
  }

  Future<void> _disableSecureMode() async {
    try {
      await FlutterWindowManager.clearFlags(FlutterWindowManager.FLAG_SECURE);
    } catch (e) {
      debugPrint('Error disabling secure mode: $e');
    }
  }

  void _initializePlayer() async {
    _videoPlayerController = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl));
    await _videoPlayerController.initialize();

    if (mounted) {
      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: false,
        looping: false,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        errorBuilder: (context, errorMessage) {
          return Center(
            child: Text(
              errorMessage,
              style: const TextStyle(color: Colors.white),
            ),
          );
        },
      );
      setState(() {});
    }
  }

  void _setupWatermarkAnimation() {
    _watermarkController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat(reverse: true);

    _watermarkAnimation = Tween<Offset>(
      begin: const Offset(-0.8, -0.8),
      end: const Offset(0.8, 0.8),
    ).animate(_watermarkController);
  }

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    _watermarkController.dispose();
    _disableSecureMode();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        _chewieController != null && _videoPlayerController.value.isInitialized
            ? Chewie(controller: _chewieController!)
            : const Center(child: CircularProgressIndicator()),

        // Dynamic Watermark
        Positioned.fill(
          child: SlideTransition(
            position: _watermarkAnimation,
            child: IgnorePointer(
              child: Opacity(
                opacity: 0.3,
                child: Text(
                  '${widget.studentId}\n${DateTime.now().toString()}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
