import 'package:flutter/material.dart';
import '../widgets/video_player_widget.dart';

class VideoPlayerScreen extends StatelessWidget {
  final String url;
  final bool isYouTube;

  const VideoPlayerScreen({
    Key? key,
    required this.url,
    required this.isYouTube,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Video Player')),
      body: Center(
        child: VideoPlayerWidget(
          url: url,
          isYouTube: isYouTube,
        ),
      ),
    );
  }
}
