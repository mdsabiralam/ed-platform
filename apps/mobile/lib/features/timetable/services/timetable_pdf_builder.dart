import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class TimetablePdfBuilder {
  static Future<void> generateMasterView(
      Map<String, List<dynamic>> data, String title) async {
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a3.landscape,
        build: (pw.Context context) {
          return pw.Column(
            children: [
              pw.Header(
                level: 0,
                child: pw.Text(title, style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
              ),
              pw.SizedBox(height: 20),
              // Dense grid implementation
              _buildMasterGrid(data),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
    );
  }

  static Future<void> generateSpecificView(
      Map<String, List<dynamic>> data, String title, PdfPageFormat format) async {
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: format,
        build: (pw.Context context) {
          return pw.Column(
            children: [
               pw.Header(
                level: 0,
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('School Name', style: pw.TextStyle(fontSize: 18)), // Placeholder for Logo
                    pw.Text(title, style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                  ]
                )
              ),
              pw.Divider(),
              pw.SizedBox(height: 20),
              // Spacious table
              _buildSpecificTable(data),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
    );
  }

  static pw.Widget _buildMasterGrid(Map<String, List<dynamic>> data) {
    // Flatten data for grid: Row = TimeSlot, Col = Day or Class
    // This is a simplified representation.
    // In a real master view, we might need a matrix of Classes x Periods for a specific day,
    // or Day x Period for all classes (which is huge).
    // Assuming "Master View" means "All Classes Schedule for the Week" is too big for one page even A3.
    // Let's assume the data passed is "All Classes for Today" or "One Class for All Week" (but that's specific view).

    // Implementation: List of Tables (one per day) or Big Matrix.
    // For demonstration, we create a table based on keys (Days).

    return pw.Table.fromTextArray(
      context: null,
      headers: ['Day', 'Routine Details'],
      data: data.entries.map((e) {
        final day = e.key;
        final entries = e.value as List<dynamic>;
        final details = entries.map((entry) =>
          "${entry['timeSlot']['name']}: ${entry['subject']['name']} (${entry['room']['name']})"
        ).join('\n');
        return [day, details];
      }).toList(),
      headerStyle: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold),
      cellStyle: const pw.TextStyle(fontSize: 8),
      border: pw.TableBorder.all(),
    );
  }

  static pw.Widget _buildSpecificTable(Map<String, List<dynamic>> data) {
    // Spacious table for specific class/teacher
    return pw.Table.fromTextArray(
      context: null,
      headers: ['Day', 'Time', 'Subject', 'Room'],
      data: data.entries.expand((e) {
        final day = e.key;
        final entries = e.value as List<dynamic>;
        return entries.map((entry) => [
          day,
          "${entry['timeSlot']['startTime']} - ${entry['timeSlot']['endTime']}",
          entry['subject']['name'],
          entry['room']['name'] ?? 'N/A'
        ]);
      }).toList(),
      headerStyle: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold),
      cellStyle: const pw.TextStyle(fontSize: 10),
      cellPadding: const pw.EdgeInsets.all(5),
    );
  }
}
