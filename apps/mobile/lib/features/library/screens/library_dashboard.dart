import 'package:flutter/material.dart';
import 'package:mobile/core/ui/responsive_layout.dart';
import 'package:mobile/features/library/models/library_models.dart';

// --- Mock Services & Dependencies (Mocked for Prototype) ---

class LibraryService {
  // Config
  static const int maxBooksPerStudent = 2;
  static const double dailyFineRate = 10.0;

  Future<void> issueBook(String isbn, String studentId) async {
    // 1. Validate Active Books Count
    int activeBooks = 1; // Mock db query
    if (activeBooks >= maxBooksPerStudent) {
      throw Exception("Student has reached max book limit.");
    }

    // 2. Check Overdue Fines
    bool hasFines = false; // Mock db query
    if (hasFines) {
       throw Exception("Clear outstanding fines first.");
    }

    // Process Issue
    print("Book $isbn issued to $studentId");
  }

  Future<double> returnBook(String isbn) async {
    // Mock logic
    final dueDate = DateTime.now().subtract(const Duration(days: 2)); // 2 days overdue
    final today = DateTime.now();

    int daysLate = today.difference(dueDate).inDays;
    double fine = 0.0;

    if (daysLate > 0) {
      fine = daysLate * dailyFineRate;
      // Post fine to Finance Ledger automatically logic here
      print("Fine calculated: $fine. Posting to Finance Ledger...");
    }

    print("Book $isbn returned.");
    return fine;
  }
}

// --- Librarian Dashboard Screen ---

class LibraryDashboardScreen extends StatelessWidget {
  const LibraryDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ResponsiveLayout(
      mobile: const _MobileLibraryLayout(),
      desktop: const _WebLibraryLayout(),
    );
  }
}

// --- Mobile Layout (Tabs) ---
class _MobileLibraryLayout extends StatelessWidget {
  const _MobileLibraryLayout();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text("Librarian Dashboard"),
          backgroundColor: Colors.brown,
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.sync_alt), text: "Circulation"),
              Tab(icon: Icon(Icons.menu_book), text: "Catalog"),
              Tab(icon: Icon(Icons.add), text: "Add Book"),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _CirculationTab(),
            _CatalogTab(),
            _AddBookTab(),
          ],
        ),
      ),
    );
  }
}

// --- Web Layout (Sidebar) ---
class _WebLibraryLayout extends StatelessWidget {
  const _WebLibraryLayout();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          NavigationRail(
            backgroundColor: Colors.brown.shade50,
            selectedIndex: 0,
            onDestinationSelected: (val) {},
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.inventory), label: Text('Inventory')),
              NavigationRailDestination(icon: Icon(Icons.desktop_windows), label: Text('Desk')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: _CatalogTab(isWeb: true),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Tabs Implementation ---

class _CirculationTab extends StatefulWidget {
  const _CirculationTab();

  @override
  State<_CirculationTab> createState() => _CirculationTabState();
}

class _CirculationTabState extends State<_CirculationTab> {
  final LibraryService _service = LibraryService();
  String? scannedIsbn;
  String? scannedStudentId;
  String _statusMessage = "Ready to Scan";

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Top: Camera Preview (Mocked Container)
        Expanded(
          flex: 4,
          child: Container(
            color: Colors.black,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.qr_code_scanner, color: Colors.white, size: 64),
                  const SizedBox(height: 16),
                  const Text("Scanner Active", style: TextStyle(color: Colors.white)),
                  // Mock Buttons for Testing
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () => setState(() => scannedIsbn = "978-3-16-148410-0"),
                        child: const Text("Simulate ISBN"),
                      ),
                      TextButton(
                        onPressed: () => setState(() => scannedStudentId = "STU-2025-001"),
                        child: const Text("Simulate Student ID"),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ),
        // Bottom: Action Card
        Expanded(
          flex: 3,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text("Action Desk", style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                _buildInfoRow("Book ISBN:", scannedIsbn ?? "Waiting..."),
                _buildInfoRow("Student ID:", scannedStudentId ?? "Waiting..."),
                const SizedBox(height: 12),
                Text(_statusMessage, style: TextStyle(color: Colors.brown.shade700, fontStyle: FontStyle.italic)),
                const Spacer(),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.arrow_upward),
                        label: const Text("ISSUE"),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.deepOrange),
                        onPressed: (scannedIsbn != null && scannedStudentId != null)
                          ? () async {
                              try {
                                await _service.issueBook(scannedIsbn!, scannedStudentId!);
                                setState(() => _statusMessage = "Success: Issued to $scannedStudentId");
                              } catch(e) {
                                setState(() => _statusMessage = "Error: $e");
                              }
                            }
                          : null,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.arrow_downward),
                        label: const Text("RETURN"),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.brown),
                        onPressed: (scannedIsbn != null)
                          ? () async {
                              final fine = await _service.returnBook(scannedIsbn!);
                              setState(() {
                                _statusMessage = fine > 0
                                  ? "Returned. Overdue Fine: \$$fine applied."
                                  : "Returned Successfully.";
                              });
                            }
                          : null,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(fontFamily: 'Monospace')),
        ],
      ),
    );
  }
}

class _CatalogTab extends StatelessWidget {
  final bool isWeb;
  const _CatalogTab({this.isWeb = false});

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final books = [
      Book(id: '1', isbn: '978-01', title: 'Clean Code', author: 'Bob Martin', category: 'Tech', rackLocation: 'A1', status: BookStatus.available),
      Book(id: '2', isbn: '978-02', title: 'The Alchemist', author: 'Coelho', category: 'Fiction', rackLocation: 'B3', status: BookStatus.issued),
      Book(id: '3', isbn: '978-03', title: 'Physics Vol 1', author: 'HC Verma', category: 'Science', rackLocation: 'S1', status: BookStatus.lost),
    ];

    if (isWeb) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Book Inventory", style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 16),
          Expanded(
            child: DataTable(
              columns: const [
                 DataColumn(label: Text('ISBN')),
                 DataColumn(label: Text('Title')),
                 DataColumn(label: Text('Author')),
                 DataColumn(label: Text('Category')),
                 DataColumn(label: Text('Rack')),
                 DataColumn(label: Text('Status')),
              ],
              rows: books.map((book) => DataRow(cells: [
                DataCell(Text(book.isbn)),
                DataCell(Text(book.title)),
                DataCell(Text(book.author)),
                DataCell(Text(book.category)),
                DataCell(Text(book.rackLocation)),
                DataCell(_buildStatusChip(book.status)),
              ])).toList(),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      itemCount: books.length,
      itemBuilder: (context, index) {
        final book = books[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text(book.title, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text("${book.author} • ${book.rackLocation}"),
            trailing: _buildStatusChip(book.status),
          ),
        );
      },
    );
  }

  Widget _buildStatusChip(BookStatus status) {
    Color color;
    String label;
    switch (status) {
      case BookStatus.available:
        color = Colors.green;
        label = "Available";
        break;
      case BookStatus.issued:
        color = Colors.grey;
        label = "Issued";
        break;
      case BookStatus.lost:
        color = Colors.red;
        label = "Lost";
        break;
    }
    return Chip(
      label: Text(label, style: const TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: color,
    );
  }
}

class _AddBookTab extends StatelessWidget {
  const _AddBookTab();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        child: Column(
          children: [
            TextFormField(decoration: const InputDecoration(labelText: 'ISBN', prefixIcon: Icon(Icons.qr_code))),
            const SizedBox(height: 12),
            TextFormField(decoration: const InputDecoration(labelText: 'Book Title', prefixIcon: Icon(Icons.title))),
            const SizedBox(height: 12),
            TextFormField(decoration: const InputDecoration(labelText: 'Author', prefixIcon: Icon(Icons.person))),
            const SizedBox(height: 12),
            TextFormField(decoration: const InputDecoration(labelText: 'Rack Location', prefixIcon: Icon(Icons.shelves))),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: Colors.brown),
                child: const Text("Add to Catalog"),
              ),
            )
          ],
        ),
      ),
    );
  }
}
