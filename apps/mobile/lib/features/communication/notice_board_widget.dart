import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'models/notice_model.dart';
import 'notice_repository.dart';
import 'notice_detail_screen.dart';

class NoticeBoardWidget extends StatefulWidget {
  final NoticeRepository repository;

  const NoticeBoardWidget({Key? key, required this.repository}) : super(key: key);

  @override
  _NoticeBoardWidgetState createState() => _NoticeBoardWidgetState();
}

class _NoticeBoardWidgetState extends State<NoticeBoardWidget> {
  List<Notice> notices = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotices();
  }

  void _fetchNotices() async {
    try {
      final allNotices = await widget.repository.getNotices();
      setState(() {
        notices = allNotices.take(3).toList();
        isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (notices.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Notices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.arrow_forward),
                onPressed: () {
                   // Navigate to list
                },
              )
            ],
          ),
        ),
        SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: notices.length,
            itemBuilder: (context, index) {
              final notice = notices[index];
              return GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => NoticeDetailScreen(notice: notice)),
                  );
                },
                child: Container(
                  width: 280,
                  margin: const EdgeInsets.only(left: 16, bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [const BoxShadow(blurRadius: 4, color: Colors.black12)],
                    border: notice.isPinned ? Border.all(color: Colors.orange, width: 2) : null,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          if (notice.isNew)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              margin: const EdgeInsets.only(right: 6),
                              decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                              child: const Text('NEW', style: TextStyle(color: Colors.white, fontSize: 10)),
                            ),
                          Expanded(child: Text(notice.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold))),
                        ],
                      ),
                      const Spacer(),
                      Text(DateFormat('MMM d, yyyy').format(notice.publishedAt), style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
