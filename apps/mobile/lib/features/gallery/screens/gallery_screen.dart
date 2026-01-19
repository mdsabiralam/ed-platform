import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:cached_network_image/cached_network_image.dart';
// import 'package:share_plus/share_plus.dart'; // Commented to prevent analysis error if missing
import '../models/gallery_item.dart';

class GalleryScreen extends StatelessWidget {
  const GalleryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final items = List.generate(10, (index) => GalleryItem(
      id: '$index',
      thumbnailUrl: 'https://picsum.photos/200/${(index % 2 == 0) ? 300 : 200}?random=$index',
      fullUrl: 'https://picsum.photos/800/1200?random=$index',
      title: 'Event $index',
    ));

    return Scaffold(
      appBar: AppBar(
        title: const Text('School Gallery', style: TextStyle(color: Colors.white)),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Colors.pink, Colors.purple, Colors.blue]), // Colorful/Gradient
          ),
        ),
      ),
      body: MasonryGridView.count(
        padding: const EdgeInsets.all(8),
        crossAxisCount: 2,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return GestureDetector(
            onTap: () => _openFullScreen(context, item),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: item.thumbnailUrl,
                placeholder: (context, url) => Container(
                  height: 150,
                  color: Colors.grey.shade200,
                  child: const Center(child: CircularProgressIndicator())
                ),
                errorWidget: (context, url, error) => const Icon(Icons.error),
                fit: BoxFit.cover,
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
           // Admin Bulk Upload (Web) logic simulation
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Bulk Upload (Admin Only)')));
        },
        child: const Icon(Icons.upload),
      ),
    );
  }

  void _openFullScreen(BuildContext context, GalleryItem item) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // Viral Loop Logic
              // 1. Call API /api/social/watermark/inject
              // 2. Share.shareXFiles(...)
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sharing with School Watermark...')));
            },
          )
        ],
      ),
      body: Center(
        child: CachedNetworkImage(
          imageUrl: item.fullUrl,
          placeholder: (context, url) => const CircularProgressIndicator(),
        ),
      ),
    )));
  }
}
