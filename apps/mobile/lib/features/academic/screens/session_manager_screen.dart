import 'package:flutter/material.dart';

class SessionManagerScreen extends StatelessWidget {
  const SessionManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Academic Structure'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('New Session', style: TextStyle(color: Colors.white)),
            onPressed: () {},
          ),
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
    return ListView.builder(
      itemCount: 3,
      itemBuilder: (context, index) {
        return ExpansionTile(
          title: Text('Session 202${3+index}-2${4+index}'),
          trailing: index == 0
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(12)),
                  child: const Text('Current', style: TextStyle(color: Colors.white, fontSize: 10)),
                )
              : null,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 16.0),
              child: ExpansionTile(
                title: const Text('Class 10'),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Wrap(
                      spacing: 8,
                      children: ['A', 'B', 'C'].map((section) {
                        return Chip(
                          label: Text('Section $section'),
                          onDeleted: () {},
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Row(
      children: [
        // Sessions List
        Expanded(
          flex: 2,
          child: Column(
            children: [
              const ListTile(title: Text('Sessions', style: TextStyle(fontWeight: FontWeight.bold))),
              Expanded(
                child: ListView.builder(
                  itemCount: 3,
                  itemBuilder: (context, index) {
                    return ListTile(
                      title: Text('Session 202${3+index}-2${4+index}'),
                      selected: index == 0,
                      trailing: index == 0
                          ? const Chip(label: Text('Current', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green)
                          : null,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        // Classes List
        Expanded(
          flex: 2,
          child: Column(
            children: [
              const ListTile(title: Text('Classes (Session 2023-24)', style: TextStyle(fontWeight: FontWeight.bold))),
              Expanded(
                child: ListView.builder(
                  itemCount: 12,
                  itemBuilder: (context, index) {
                    return ListTile(
                      title: Text('Class ${index + 1}'),
                      selected: index == 9,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        // Sections Grid
        Expanded(
          flex: 3,
          child: Column(
            children: [
              ListTile(
                title: const Text('Sections (Class 10)', style: TextStyle(fontWeight: FontWeight.bold)),
                trailing: IconButton(icon: const Icon(Icons.add), onPressed: () {}),
              ),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 3,
                  padding: const EdgeInsets.all(16),
                  children: ['A', 'B', 'C'].map((section) {
                    return Card(
                      child: InkWell(
                        onTap: () {},
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Section $section', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            const Text('Room 101'),
                            const Text('Capacity: 40'),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
