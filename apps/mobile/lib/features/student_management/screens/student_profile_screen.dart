import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

class StudentProfileScreen extends StatelessWidget {
  final String studentId;
  const StudentProfileScreen({super.key, required this.studentId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MediaQuery.of(context).size.width <= 800
          ? null
          : AppBar(
              title: Text('Student > Profile $studentId'),
              backgroundColor: const Color(0xFF0D47A1),
              foregroundColor: Colors.white,
              actions: [
                IconButton(icon: const Icon(Icons.edit), onPressed: () => context.go('/student/edit/$studentId')),
                IconButton(icon: const Icon(Icons.block, color: Colors.red), onPressed: () {}),
              ],
            ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout(context);
          }
          return _buildMobileLayout(context);
        },
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 250.0,
              floating: false,
              pinned: true,
              backgroundColor: const Color(0xFF0D47A1),
              flexibleSpace: FlexibleSpaceBar(
                title: Text('Student Name $studentId', style: const TextStyle(fontSize: 16)),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                     Container(color: Colors.blue.shade800),
                     const Center(
                       child: Column(
                         mainAxisAlignment: MainAxisAlignment.center,
                         children: [
                           CircleAvatar(radius: 40, child: Icon(Icons.person, size: 40)),
                           SizedBox(height: 8),
                           Text('Roll No: 12', style: TextStyle(color: Colors.white)),
                         ],
                       ),
                     )
                  ],
                ),
              ),
            ),
            const SliverPersistentHeader(
              delegate: _SliverAppBarDelegate(
                TabBar(
                  labelColor: Colors.black87,
                  unselectedLabelColor: Colors.grey,
                  tabs: [
                    Tab(text: 'Personal'),
                    Tab(text: 'Academic'),
                    Tab(text: 'Fees'),
                  ],
                ),
              ),
              pinned: true,
            ),
          ];
        },
        body: TabBarView(
          children: [
            _buildPersonalTab(context),
            _buildAcademicTab(),
            _buildFeesTab(context),
          ],
        ),
      ),
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: _buildProfileCard(context),
          ),
          const SizedBox(width: 24),
          Expanded(
            flex: 7,
            child: DefaultTabController(
              length: 3,
              child: Column(
                children: [
                  const TabBar(
                    labelColor: Color(0xFF0D47A1),
                    unselectedLabelColor: Colors.grey,
                    tabs: [
                      Tab(text: 'Personal'),
                      Tab(text: 'Academic'),
                      Tab(text: 'Fees'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: TabBarView(
                      children: [
                        _buildPersonalTab(context),
                        _buildAcademicTab(),
                        _buildFeesTab(context),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
            const SizedBox(height: 16),
            Text('Student Name $studentId', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text('Class 10 • Section A • Roll 12', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(icon: const Icon(Icons.call, color: Colors.green), onPressed: () => _makePhoneCall('1234567890')),
                IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => context.go('/student/edit/$studentId')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPersonalTab(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const ListTile(leading: Icon(Icons.person_outline), title: Text('Guardian'), subtitle: Text('Father Name')),
        ListTile(
            leading: const Icon(Icons.phone),
            title: const Text('Phone'),
            subtitle: const Text('+1 234 567 890'),
            trailing: IconButton(icon: const Icon(Icons.call), onPressed: () => _makePhoneCall('1234567890'))
        ),
        const ListTile(leading: Icon(Icons.home), title: Text('Address'), subtitle: Text('123 Main St, City')),
        const ListTile(leading: Icon(Icons.cake), title: Text('DOB'), subtitle: Text('01 Jan 2010')),
        const ListTile(leading: Icon(Icons.bloodtype), title: Text('Blood Group'), subtitle: Text('A+')),
      ],
    );
  }

  Widget _buildAcademicTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 120,
              height: 120,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  const CircularProgressIndicator(value: 0.85, strokeWidth: 10, color: Colors.green),
                  const Center(child: Text('85%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),
        const Text('Exam Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...List.generate(3, (index) {
          return Card(
            child: ListTile(
              title: Text('Subject $index'),
              trailing: Text('GPA 4.${index + 5}', style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildFeesTab(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          color: Colors.red.shade50,
          child: ListTile(
            title: const Text('Total Dues'),
            subtitle: const Text('Please pay immediately'),
            trailing: const Text('\$500', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18)),
            onTap: () {}, // Navigate to Fee Collection
          ),
        ),
        const SizedBox(height: 16),
        const Text('Payment History', style: TextStyle(fontWeight: FontWeight.bold)),
        ...List.generate(3, (index) {
          return Card(
            child: ListTile(
              title: const Text('Tuition Fee - Sep'),
              subtitle: const Text('Paid on 10 Sep'),
              trailing: const Text('\$200', style: TextStyle(color: Colors.green)),
            ),
          );
        }),
      ],
    );
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }
}

class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar _tabBar;
  const _SliverAppBarDelegate(this._tabBar);

  @override
  double get minExtent => _tabBar.preferredSize.height;
  @override
  double get maxExtent => _tabBar.preferredSize.height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white,
      child: _tabBar,
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) => false;
}
