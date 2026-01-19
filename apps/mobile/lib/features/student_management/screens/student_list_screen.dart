import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  String? _selectedClass;
  String? _selectedSection;
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Directory'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/student/admission'),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilters(),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                if (_selectedClass == null || _selectedSection == null) {
                  return _buildEmptyState();
                }
                if (constraints.maxWidth > 800) {
                  return _buildWebLayout(context);
                }
                return _buildMobileLayout(context);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey.shade100,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedClass,
                  decoration: const InputDecoration(labelText: 'Class', border: OutlineInputBorder()),
                  items: ['Class 1', 'Class 2', 'Class 10'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                  onChanged: (val) => setState(() => _selectedClass = val),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedSection,
                  decoration: const InputDecoration(labelText: 'Section', border: OutlineInputBorder()),
                  items: ['A', 'B', 'C'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                  onChanged: (val) => setState(() => _selectedSection = val),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              labelText: 'Search by Name or Roll No',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.school, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text('Please select a Class and Section', style: TextStyle(fontSize: 18, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return ListView.builder(
      itemCount: 15,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.grey.shade200,
              child: Text('${index + 1}', style: const TextStyle(color: Colors.black)),
            ),
            title: Text('Student Name $index', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Father Name'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => context.go('/student/profile/$index'),
          ),
        );
      },
    );
  }

  Widget _buildWebLayout(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Card(
        child: SizedBox(
          width: double.infinity,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Roll')),
              DataColumn(label: Text('Photo')),
              DataColumn(label: Text('Name')),
              DataColumn(label: Text('Class')),
              DataColumn(label: Text('Section')),
              DataColumn(label: Text('Parent Name')),
              DataColumn(label: Text('Phone')),
              DataColumn(label: Text('Actions')),
            ],
            rows: List.generate(15, (index) {
              return DataRow(
                cells: [
                  DataCell(Text('${index + 1}')),
                  const DataCell(CircleAvatar(radius: 16, child: Icon(Icons.person, size: 16))),
                  DataCell(Text('Student Name $index')),
                  DataCell(Text(_selectedClass ?? '')),
                  DataCell(Text(_selectedSection ?? '')),
                  const DataCell(Text('Father Name')),
                  const DataCell(Text('123-456-7890')),
                  DataCell(
                    IconButton(
                      icon: const Icon(Icons.visibility, color: Colors.grey),
                      onPressed: () => context.go('/student/profile/$index'),
                    ),
                  ),
                ],
              );
            }),
          ),
        ),
      ),
    );
  }
}
