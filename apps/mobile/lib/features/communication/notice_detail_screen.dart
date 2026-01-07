import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:share_plus/share_plus.dart';
import 'models/notice_model.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;

class NoticeDetailScreen extends StatefulWidget {
  final Notice notice;

  const NoticeDetailScreen({Key? key, required this.notice}) : super(key: key);

  @override
  _NoticeDetailScreenState createState() => _NoticeDetailScreenState();
}

class _NoticeDetailScreenState extends State<NoticeDetailScreen> {
  String? localPath;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.notice.attachmentUrl != null && widget.notice.attachmentUrl!.endsWith('.pdf')) {
      _downloadPdf();
    }
  }

  Future<void> _downloadPdf() async {
    setState(() => loading = true);
    try {
      final url = widget.notice.attachmentUrl!;
      final response = await http.get(Uri.parse(url));
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/temp_${widget.notice.id}.pdf');
      await file.writeAsBytes(response.bodyBytes);
      setState(() {
        localPath = file.path;
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
      print('Error downloading PDF: $e');
    }
  }

  void _share() {
    Share.share('${widget.notice.title}\n${widget.notice.content}\n${widget.notice.attachmentUrl ?? ""}');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notice Detail'),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: _share),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.notice.title, style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text(widget.notice.content),
              ],
            ),
          ),
          Expanded(
            child: widget.notice.attachmentUrl != null
                ? (widget.notice.attachmentUrl!.endsWith('.pdf')
                    ? (loading
                        ? const Center(child: CircularProgressIndicator())
                        : (localPath != null
                            ? PDFView(filePath: localPath!)
                            : const Center(child: Text("Failed to load PDF"))))
                    : Image.network(widget.notice.attachmentUrl!))
                : const SizedBox(),
          ),
        ],
      ),
    );
  }
}
