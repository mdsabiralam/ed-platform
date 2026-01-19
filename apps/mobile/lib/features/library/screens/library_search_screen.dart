import 'package:flutter/material.dart';

class LibrarySearchScreen extends StatelessWidget {
  const LibrarySearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Library'),
          backgroundColor: Colors.brown.shade700,
          foregroundColor: Colors.white,
          bottom: const TabBar(
            labelColor: Colors.white,
            indicatorColor: Colors.amber,
            tabs: [
              Tab(text: 'Catalog'),
              Tab(text: 'My Books'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _CatalogTab(),
            _MyBooksTab(),
          ],
        ),
      ),
    );
  }
}

class _CatalogTab extends StatelessWidget {
  const _CatalogTab();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search Title, Author, Category...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: Colors.grey.shade100,
            ),
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 150,
              childAspectRatio: 0.6,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: 10,
            itemBuilder: (context, index) {
              return Card(
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        color: Colors.brown.shade200,
                        child: const Icon(Icons.book, size: 48, color: Colors.white),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Book Title $index', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('Author Name', style: TextStyle(fontSize: 10, color: Colors.grey.shade700)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                            child: const Text('Available', style: TextStyle(fontSize: 10, color: Colors.green)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _MyBooksTab extends StatelessWidget {
  const _MyBooksTab();

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3,
      itemBuilder: (context, index) {
        final isOverdue = index == 0;
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            leading: const Icon(Icons.book, color: Colors.brown, size: 40),
            title: Text('Issued Book ${index + 1}'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Issued: 01 Oct 2023'),
                Text(
                  'Due: ${isOverdue ? "10 Oct 2023" : "20 Oct 2023"}',
                  style: TextStyle(color: isOverdue ? Colors.red : Colors.green, fontWeight: FontWeight.bold),
                ),
                if (isOverdue)
                  const Text('Fine: \$5.00', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
              ],
            ),
            trailing: isOverdue
               ? ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white), child: const Text('Pay Fine'))
               : const Chip(label: Text('Reading'), backgroundColor: Colors.amberAccent),
          ),
        );
      },
    );
  }
}
