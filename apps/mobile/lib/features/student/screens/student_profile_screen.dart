import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class StudentProfileScreen extends StatelessWidget {
  const StudentProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DefaultTabController(
        length: 3,
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              SliverAppBar(
                expandedHeight: 200,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  title: const Text('John Doe'),
                  background: CachedNetworkImage(
                    imageUrl: 'https://via.placeholder.com/300',
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
                    errorWidget: (context, url, error) => const Icon(Icons.error),
                  ),
                ),
              ),
              const SliverPersistentHeader(
                delegate: _SliverAppBarDelegate(
                  TabBar(
                    labelColor: Colors.black,
                    tabs: [
                      Tab(text: 'Timeline'),
                      Tab(text: 'Info'),
                      Tab(text: 'Documents'),
                    ],
                  ),
                ),
                pinned: true,
              ),
            ];
          },
          body: TabBarView(
            children: [
              _buildTimeline(),
              _buildInfo(),
              _buildDocuments(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeline() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(leading: Icon(Icons.circle, size: 12), title: Text('Promoted to Class 10'), subtitle: Text('2023')),
        ListTile(leading: Icon(Icons.circle, size: 12), title: Text('Joined School'), subtitle: Text('2020')),
      ],
    );
  }

  Widget _buildInfo() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        ListTile(title: Text('Date of Birth'), subtitle: Text('01 Jan 2010')),
        ListTile(title: Text('Address'), subtitle: Text('123, ***** St, City')),
        ListTile(title: Text('Guardian'), subtitle: Text('Mr. Doe')),
      ],
    );
  }

  Widget _buildDocuments() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          leading: const Icon(Icons.description),
          title: const Text('Birth Certificate.pdf'),
          trailing: IconButton(icon: const Icon(Icons.download), onPressed: () {}),
        ),
        ListTile(
          leading: const Icon(Icons.image),
          title: const Text('Photo.jpg'),
          trailing: IconButton(icon: const Icon(Icons.download), onPressed: () {}),
        ),
      ],
    );
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(color: Colors.white, child: _tabBar);
  }
  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) => false;
}
