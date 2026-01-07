import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NoticeItem {
  final String id;
  final String title;
  final String date;
  final String content;
  final bool isPinned;

  NoticeItem({required this.id, required this.title, required this.date, required this.content, this.isPinned = false});
}

class SmartNoticeBoard extends StatefulWidget {
  const SmartNoticeBoard({Key? key}) : super(key: key);

  @override
  State<SmartNoticeBoard> createState() => _SmartNoticeBoardState();
}

class _SmartNoticeBoardState extends State<SmartNoticeBoard> {
  // Mock Data
  final List<NoticeItem> _notices = [
    NoticeItem(id: '101', title: 'School Closed Tomorrow', date: '2024-03-10', content: 'Due to heavy rain...', isPinned: true),
    NoticeItem(id: '102', title: 'Annual Sports Day', date: '2024-03-08', content: 'Register now...'),
    NoticeItem(id: '103', title: 'Exam Schedule', date: '2024-03-05', content: 'Final exams start on...'),
  ];

  Set<String> _readNoticeIds = {};

  @override
  void initState() {
    super.initState();
    _loadReadStatus();
  }

  Future<void> _loadReadStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final readList = prefs.getStringList('read_notices') ?? [];
    setState(() {
      _readNoticeIds = readList.toSet();
    });
  }

  Future<void> _markAsRead(String id) async {
    if (!_readNoticeIds.contains(id)) {
      setState(() {
        _readNoticeIds.add(id);
      });
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('read_notices', _readNoticeIds.toList());
    }
  }

  @override
  Widget build(BuildContext context) {
    // Sort: Pinned first, then by date (mock date sort assuming string compare for now, ideally DateTime)
    final sortedNotices = List<NoticeItem>.from(_notices)
      ..sort((a, b) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.date.compareTo(a.date); // Descending date
      });

    return Scaffold(
      appBar: AppBar(title: const Text("Notice Board")),
      body: ListView.builder(
        itemCount: sortedNotices.length,
        itemBuilder: (context, index) {
          final notice = sortedNotices[index];
          final isRead = _readNoticeIds.contains(notice.id);

          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            elevation: notice.isPinned ? 4 : 1,
            color: notice.isPinned ? Colors.yellow.shade50 : Colors.white,
            child: ListTile(
              leading: Stack(
                children: [
                   Icon(notice.isPinned ? Icons.push_pin : Icons.notifications, color: Colors.blue),
                   if (!isRead)
                     Positioned(
                       right: 0,
                       top: 0,
                       child: Container(
                         width: 10,
                         height: 10,
                         decoration: const BoxDecoration(
                           color: Colors.red,
                           shape: BoxShape.circle,
                         ),
                       ),
                     ),
                ],
              ),
              title: Text(notice.title, style: TextStyle(fontWeight: notice.isPinned ? FontWeight.bold : FontWeight.normal)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(notice.date, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text(notice.content, maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
              onTap: () {
                _markAsRead(notice.id);
                // Navigate to details screen or show dialog
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: Text(notice.title),
                    content: Text(notice.content),
                    actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Close"))],
                  )
                );
              },
            ),
          );
        },
      ),
    );
  }
}
