import 'package:flutter/material.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import 'package:share_plus/share_plus.dart';

class ResultViewerScreen extends StatefulWidget {
  final String pdfUrl;
  final String studentName;
  final String examName;

  const ResultViewerScreen({
    Key? key,
    required this.pdfUrl,
    required this.studentName,
    required this.examName,
  }) : super(key: key);

  @override
  State<ResultViewerScreen> createState() => _ResultViewerScreenState();
}

class _ResultViewerScreenState extends State<ResultViewerScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.examName} Report'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              Share.share(
                'Check out the report card for ${widget.studentName}: ${widget.pdfUrl}',
                subject: '${widget.examName} Result - ${widget.studentName}',
              );
            },
          ),
        ],
      ),
      body: const PDF(
        enableSwipe: true,
        swipeHorizontal: true,
        autoSpacing: false,
        pageFling: false,
      ).cachedFromUrl(
        widget.pdfUrl,
        placeholder: (progress) => Center(child: Text('$progress %')),
        errorWidget: (error) => Center(child: Text(error.toString())),
      ),
    );
  }
}
