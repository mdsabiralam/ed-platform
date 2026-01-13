import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:video_player/video_player.dart';

class VideoPlayerWidget extends StatefulWidget {
  final String url;
  final bool isYouTube;

  const VideoPlayerWidget({
    Key? key,
    required this.url,
    required this.isYouTube,
  }) : super(key: key);

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  late YoutubePlayerController _youtubeController;
  VideoPlayerController? _videoController;
  bool _isNativeInitialized = false;

  @override
  void initState() {
    super.initState();
    if (widget.isYouTube) {
      final videoId = YoutubePlayer.convertUrlToId(widget.url) ?? '';
      _youtubeController = YoutubePlayerController(
        initialVideoId: videoId,
        flags: const YoutubePlayerFlags(
          autoPlay: true,
          mute: false,
        ),
      );
    } else {
      _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.url))
        ..initialize().then((_) {
          setState(() {
            _isNativeInitialized = true;
          });
          _videoController?.play();
        });
    }
  }

  @override
  void dispose() {
    if (widget.isYouTube) {
      _youtubeController.dispose();
    } else {
      _videoController?.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isYouTube) {
      return YoutubePlayer(
        controller: _youtubeController,
        showVideoProgressIndicator: true,
      );
    } else {
      return _isNativeInitialized
          ? AspectRatio(
              aspectRatio: _videoController!.value.aspectRatio,
              child: VideoPlayer(_videoController!),
            )
          : const Center(child: CircularProgressIndicator());
    }
  }
}
