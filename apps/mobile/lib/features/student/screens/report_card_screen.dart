import 'package:flutter/material.dart';
import 'package:printing/printing.dart'; // For PdfPreview
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class ReportCardScreen extends StatefulWidget {
  const ReportCardScreen({super.key});

  @override
  State<ReportCardScreen> createState() => _ReportCardScreenState();
}

class _ReportCardScreenState extends State<ReportCardScreen> {
  // Mock Data
  final bool _feeDue = true; // Simulating Due Fees
  final double _amountDue = 5000;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Card'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return SingleChildScrollView(
      child: Stack(
        children: [
          Column(
            children: [
              _buildPerformanceCard(),
              _buildSubjectList(),
            ],
          ),
          if (_feeDue) _buildBlockedOverlay(),
        ],
      ),
    );
  }

  Widget _buildWebLayout() {
    return Row(
      children: [
        Expanded(
          flex: 4,
          child: Stack(
            children: [
               Column(
                children: [
                  _buildPerformanceCard(),
                  Expanded(child: _buildSubjectList()),
                ],
              ),
              if (_feeDue) _buildBlockedOverlay(),
            ],
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 6,
          child: _feeDue ? _buildBlockedOverlay() : PdfPreview(
            build: (format) => _generatePdf(format),
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      color: Colors.teal.shade50,
      child: Column(
        children: [
          const Text('Mid-Term Examination 2023', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 100,
                height: 100,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    const CircularProgressIndicator(value: 0.88, strokeWidth: 8, color: Colors.green),
                    const Center(child: Text('88%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold))),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Grade: A+', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                  Text('Rank: 5/40'),
                  Text('Attendance: 95%'),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            title: Text('Subject ${index + 1}'),
            trailing: const Text('85/100  (A)', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        );
      },
    );
  }

  Widget _buildBlockedOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.8), // High opacity for privacy
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock, size: 64, color: Colors.white),
            const SizedBox(height: 16),
            const Text('Result Withheld', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            Text('Due Amount: \$$_amountDue', style: const TextStyle(color: Colors.redAccent, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Please clear your dues to view the report card.', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {}, // Navigate to Fee Payment
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
              child: const Text('Pay Now'),
            ),
          ],
        ),
      ),
    );
  }

  Future<Uint8List> _generatePdf(PdfPageFormat format) async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.Page(
        pageFormat: format,
        build: (context) {
          return pw.Center(
            child: pw.Text('Report Card Mock PDF'),
          ); // Just a placeholder, implementing full PDF logic is complex
        },
      ),
    );
    return pdf.save();
  }
}
