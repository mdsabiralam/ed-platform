import 'package:flutter/material.dart';

class ParentHomeWidget extends StatefulWidget {
  const ParentHomeWidget({super.key});

  @override
  State<ParentHomeWidget> createState() => _ParentHomeWidgetState();
}

class _ParentHomeWidgetState extends State<ParentHomeWidget> {
  int _selectedIndex = 0;
  String _selectedChild = 'Child 1';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: DropdownButton<String>(
          value: _selectedChild,
          dropdownColor: Colors.blue,
          style: const TextStyle(color: Colors.white, fontSize: 18),
          iconEnabledColor: Colors.white,
          underline: Container(),
          items: ['Child 1', 'Child 2'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value, style: const TextStyle(color: Colors.black)),
            );
          }).toList(),
          selectedItemBuilder: (BuildContext context) {
            return ['Child 1', 'Child 2'].map<Widget>((String item) {
              return Text(item, style: const TextStyle(color: Colors.white));
            }).toList();
          },
          onChanged: (newValue) {
            setState(() {
              _selectedChild = newValue!;
            });
          },
        ),
        backgroundColor: Colors.blue,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                   // Navigate if needed, or just show list
                },
              ),
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 14,
                    minHeight: 14,
                  ),
                  child: const Text(
                    '1',
                    style: TextStyle(color: Colors.white, fontSize: 8),
                    textAlign: TextAlign.center,
                  ),
                ),
              )
            ],
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.payment), label: 'Fees'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_selectedIndex != 0) {
      return Center(child: Text('Tab $_selectedIndex Content'));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildDashboardCard('Attendance %', '85%', Icons.pie_chart, Colors.orange),
        _buildDashboardCard('Due Fees', '\$500', Icons.attach_money, Colors.red),
        _buildDashboardCard('Live Bus Status', 'On Route', Icons.directions_bus, Colors.green),
      ],
    );
  }

  Widget _buildDashboardCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              radius: 30,
              child: Icon(icon, color: color, size: 30),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                const SizedBox(height: 8),
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
