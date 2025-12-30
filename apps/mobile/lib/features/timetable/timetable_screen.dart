import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'services/timetable_pdf_builder.dart';

enum ViewMode { classView, teacherView, roomView, masterView }

class TimetableScreen extends StatefulWidget {
  final Map<String, List<dynamic>> routine; // Expecting grouped map from backend (or we group it here)

  const TimetableScreen({super.key, required this.routine});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  ViewMode _viewMode = ViewMode.classView;
  String? _selectedFilterId; // Could be classId, teacherId, roomId

  // Dummy data for dropdowns (In real app, fetch from API)
  final List<String> _classes = ['Class 10-A', 'Class 10-B'];
  final List<String> _teachers = ['Mr. Smith', 'Mrs. Jones'];
  final List<String> _rooms = ['Lab 1', 'Room 101'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Timetable'),
        actions: [
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: _showPrintDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.all(8.0),
            color: Colors.grey.shade100,
            child: Column(
              children: [
                // View Mode Selector
                DropdownButton<ViewMode>(
                  value: _viewMode,
                  isExpanded: true,
                  onChanged: (ViewMode? newValue) {
                    setState(() {
                      _viewMode = newValue!;
                      _selectedFilterId = null; // Reset filter
                    });
                  },
                  items: ViewMode.values.map<DropdownMenuItem<ViewMode>>((ViewMode value) {
                    return DropdownMenuItem<ViewMode>(
                      value: value,
                      child: Text(value.name.toUpperCase()),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 10),
                // Specific Entity Selector
                if (_viewMode != ViewMode.masterView)
                  DropdownButton<String>(
                    hint: Text('Select ${_viewMode.name.replaceAll('View', '')}'),
                    value: _selectedFilterId,
                    isExpanded: true,
                    onChanged: (String? newValue) {
                      setState(() {
                        _selectedFilterId = newValue;
                        // TODO: Trigger API fetch here based on selection
                      });
                    },
                    items: _getDropdownItems(),
                  ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: widget.routine.isEmpty
                ? const Center(child: Text('No routine data available.'))
                : ListView(
                    children: widget.routine.entries.map((entry) {
                      return _buildDaySection(entry.key, entry.value);
                    }).toList(),
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showPrintDialog,
        child: const Icon(Icons.download),
      ),
    );
  }

  List<DropdownMenuItem<String>> _getDropdownItems() {
    List<String> items = [];
    switch (_viewMode) {
      case ViewMode.classView:
        items = _classes;
        break;
      case ViewMode.teacherView:
        items = _teachers;
        break;
      case ViewMode.roomView:
        items = _rooms;
        break;
      default:
        items = [];
    }
    return items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList();
  }

  Widget _buildDaySection(String day, List<dynamic> entries) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Text(day, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        ...entries.map((entry) => _buildEntryCard(entry)).toList(),
      ],
    );
  }

  Widget _buildEntryCard(dynamic entry) {
     // Safe access handling both formats (if backend varies)
    final subject = entry['subject']?['name'] ?? entry['subject'] ?? 'Subject';
    final teacher = entry['teacher']?['name'] ?? entry['teacher'] ?? 'Teacher';
    final room = entry['room']?['name'] ?? entry['room'] ?? 'Room';
    final timeStart = entry['timeSlot']?['startTime'] ?? entry['startTime'] ?? '--';
    final timeEnd = entry['timeSlot']?['endTime'] ?? entry['endTime'] ?? '--';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        title: Text(subject, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text("$teacher • $room"),
        trailing: Text("$timeStart - $timeEnd"),
      ),
    );
  }

  void _showPrintDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Paper Size'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('A3 Landscape (Master View)'),
              onTap: () {
                Navigator.pop(context);
                TimetablePdfBuilder.generateMasterView(widget.routine, "Master Timetable");
              },
            ),
            ListTile(
              title: const Text('A4 Portrait'),
              onTap: () {
                Navigator.pop(context);
                TimetablePdfBuilder.generateSpecificView(widget.routine, "Timetable", PdfPageFormat.a4);
              },
            ),
             ListTile(
              title: const Text('A5 Portrait'),
              onTap: () {
                Navigator.pop(context);
                TimetablePdfBuilder.generateSpecificView(widget.routine, "Timetable", PdfPageFormat.a5);
              },
            ),
          ],
        ),
      ),
    );
  }
}
