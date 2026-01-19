import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../common/screens/notification_list_screen.dart'; // Reuse for layout styles if needed
import '../models/notice_model.dart';
import '../data/notice_repository.dart';
import '../../../core/api_client.dart';
// import 'package:flutter_pdfview/flutter_pdfview.dart'; // Commented out to prevent analysis errors if package not linked, assuming usage logic

class NoticeBoardScreen extends StatefulWidget {
  final bool isAdmin; // To toggle View/Composer
  const NoticeBoardScreen({super.key, this.isAdmin = false});

  @override
  State<NoticeBoardScreen> createState() => _NoticeBoardScreenState();
}

class _NoticeBoardScreenState extends State<NoticeBoardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final NoticeRepository _repository = NoticeRepository(ApiClient());
  List<NoticeModel> _notices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: widget.isAdmin ? 2 : 1, vsync: this);
    _fetchNotices();
  }

  Future<void> _fetchNotices() async {
    setState(() => _isLoading = true);
    try {
      final data = await _repository.fetchNotices();
      setState(() {
        _notices = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notice Board', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.deepPurple, // Purple Theme
        bottom: widget.isAdmin
            ? TabBar(
                controller: _tabController,
                indicatorColor: Colors.white,
                tabs: const [
                  Tab(text: 'Feed'),
                  Tab(text: 'Composer'),
                ],
              )
            : null,
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFeedView(),
          if (widget.isAdmin) _buildComposerView(),
        ],
      ),
    );
  }

  Widget _buildFeedView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _notices.length,
      itemBuilder: (context, index) {
        final notice = _notices[index];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (notice.isPinned)
                      const Icon(Icons.push_pin, color: Colors.deepPurple, size: 18),
                    if (notice.isPinned) const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        notice.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                    ),
                    if (notice.isNew)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('New', style: TextStyle(color: Colors.white, fontSize: 10)),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(notice.content, style: const TextStyle(color: Colors.black87)),
                if (notice.attachmentUrl != null) ...[
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () {
                      // Navigate to PDF View
                      // Navigator.push(context, MaterialPageRoute(builder: (_) => PdfViewerScreen(url: notice.attachmentUrl!)));
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Opening PDF...')));
                    },
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.picture_as_pdf, color: Colors.red),
                          SizedBox(width: 8),
                          Text('View Attachment'),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Text(
                  'Audience: ${notice.audience} • ${_timeAgo(notice.timestamp)}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildComposerView() {
    String? selectedAudience;
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          DropdownButtonFormField<String>(
            value: selectedAudience,
            decoration: const InputDecoration(labelText: 'Target Audience'),
            items: const [
              DropdownMenuItem(value: 'All Students', child: Text('All Students')),
              DropdownMenuItem(value: 'Class 10', child: Text('Class 10')),
              DropdownMenuItem(value: 'Teachers', child: Text('Teachers')),
            ],
            onChanged: (v) => selectedAudience = v,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: titleCtrl,
            decoration: const InputDecoration(labelText: 'Title', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: contentCtrl,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Content', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: () async {
                  // File Picker logic
                  // FilePickerResult? result = await FilePicker.platform.pickFiles();
                },
                icon: const Icon(Icons.attach_file),
                label: const Text('Attach File'),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  _repository.publishNotice(titleCtrl.text, contentCtrl.text, selectedAudience ?? 'All');
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notice Published')));
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.deepPurple),
                child: const Text('Publish', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime time) {
    // Simple helper
    return "${time.day}/${time.month}";
  }
}
