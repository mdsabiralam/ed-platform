import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:dio/dio.dart';
import '../models/marksheet_template_model.dart';
import '../data/marksheet_template_repository.dart';
import 'widgets/draggable_component.dart';

class MarksheetDesignerScreen extends StatefulWidget {
  const MarksheetDesignerScreen({Key? key}) : super(key: key);

  @override
  _MarksheetDesignerScreenState createState() =>
      _MarksheetDesignerScreenState();
}

class _MarksheetDesignerScreenState extends State<MarksheetDesignerScreen> {
  // Positions and Sizes
  Offset _headerPos = Offset(20, 20);
  Size _headerSize = Size(500, 100);

  Offset _tablePos = Offset(20, 150);
  Size _tableSize = Size(500, 200);

  Offset _footerPos = Offset(20, 400);
  Size _footerSize = Size(500, 150);

  // Configs
  bool _showLogo = true;
  double _schoolFontSize = 18;
  bool _showAttendance = true;
  bool _showSignature = true;
  String _disclaimer = 'This is a computer generated document.';

  final MarksheetTemplateRepository _repository =
      MarksheetTemplateRepository(Dio()); // Should be injected

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Marksheet Designer'),
        actions: [
          IconButton(
            icon: const Icon(Icons.preview),
            onPressed: _previewPdf,
          ),
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveTemplate,
          ),
        ],
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 250,
            color: Colors.grey[200],
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('Components',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const Divider(),
                ListTile(
                  title: const Text('Header Settings'),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SwitchListTile(
                        title: const Text('Show Logo'),
                        value: _showLogo,
                        onChanged: (v) => setState(() => _showLogo = v),
                      ),
                      const Text('Font Size'),
                      Slider(
                        value: _schoolFontSize,
                        min: 10,
                        max: 30,
                        onChanged: (v) => setState(() => _schoolFontSize = v),
                      ),
                    ],
                  ),
                ),
                ListTile(
                  title: const Text('Marks Table'),
                  subtitle: SwitchListTile(
                    title: const Text('Show Attendance'),
                    value: _showAttendance,
                    onChanged: (v) => setState(() => _showAttendance = v),
                  ),
                ),
                ListTile(
                  title: const Text('Footer'),
                  subtitle: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Principal Sig.'),
                        value: _showSignature,
                        onChanged: (v) => setState(() => _showSignature = v),
                      ),
                      TextField(
                        decoration:
                            const InputDecoration(labelText: 'Disclaimer'),
                        onChanged: (v) => _disclaimer = v,
                        controller: TextEditingController(text: _disclaimer),
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Canvas
          Expanded(
            child: Container(
              color: Colors.grey[300],
              child: Center(
                child: Container(
                  width: 595, // A4 width at 72dpi approx
                  height: 842, // A4 height at 72dpi approx
                  color: Colors.white,
                  child: Stack(
                    children: [
                      DraggableComponent(
                        label: 'Header',
                        position: _headerPos,
                        size: _headerSize,
                        onDragEnd: (pos) => setState(() => _headerPos = pos),
                        onResizeEnd: (size) => setState(() => _headerSize = size),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          child: Row(
                            children: [
                              if (_showLogo)
                                const Icon(Icons.school, size: 40),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text('School Name',
                                    style: TextStyle(fontSize: _schoolFontSize)),
                              ),
                            ],
                          ),
                        ),
                      ),
                      DraggableComponent(
                        label: 'Marks Table',
                        position: _tablePos,
                        size: _tableSize,
                        onDragEnd: (pos) => setState(() => _tablePos = pos),
                        onResizeEnd: (size) => setState(() => _tableSize = size),
                        child: Container(
                          decoration: BoxDecoration(
                              border: Border.all(color: Colors.black)),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceAround,
                                children: const [
                                  Text('Subject'),
                                  Text('Max'),
                                  Text('Obtained')
                                ],
                              ),
                              const Divider(),
                              const Text('Mathematics ...'),
                              if (_showAttendance) ...[
                                const Divider(),
                                const Text('Attendance: 90%'),
                              ]
                            ],
                          ),
                        ),
                      ),
                      DraggableComponent(
                        label: 'Footer',
                        position: _footerPos,
                        size: _footerSize,
                        onDragEnd: (pos) => setState(() => _footerPos = pos),
                        onResizeEnd: (size) => setState(() => _footerSize = size),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_disclaimer,
                                  style: const TextStyle(fontSize: 10)),
                              const SizedBox(height: 10),
                              if (_showSignature)
                                Expanded(
                                  child: Align(
                                    alignment: Alignment.bottomRight,
                                    child: Container(
                                      width: 100,
                                      height: 40,
                                      decoration: BoxDecoration(
                                          border: Border(
                                              top: BorderSide(
                                                  color: Colors.black))),
                                      child: const Center(
                                          child: Text('Principal Signature')),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _saveTemplate() async {
    final config = MarksheetTemplateConfig(
      name: 'New Template',
      layoutConfig: LayoutConfig(
        header: HeaderConfig(
            showLogo: _showLogo,
            schoolNameFontSize: _schoolFontSize,
            x: _headerPos.dx,
            y: _headerPos.dy,
            width: _headerSize.width,
            height: _headerSize.height),
        marksTable: MarksTableConfig(
            columns: ['Subject', 'Max', 'Obtained'],
            showAttendance: _showAttendance,
            x: _tablePos.dx,
            y: _tablePos.dy,
            width: _tableSize.width,
            height: _tableSize.height),
        footer: FooterConfig(
            showPrincipalSignature: _showSignature,
            disclaimerText: _disclaimer,
            x: _footerPos.dx,
            y: _footerPos.dy,
            width: _footerSize.width,
            height: _footerSize.height),
      ),
    );

    try {
      await _repository.saveTemplate(config);
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Template Saved!')));
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _previewPdf() async {
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Stack(
            children: [
              pw.Positioned(
                left: _headerPos.dx,
                top: _headerPos.dy,
                child: pw.Container(
                  width: _headerSize.width,
                  height: _headerSize.height,
                  child: pw.Row(
                  children: [
                    if (_showLogo)
                      pw.Container(
                          width: 40, height: 40, color: PdfColors.grey),
                    pw.SizedBox(width: 10),
                    pw.Text('School Name',
                        style: pw.TextStyle(fontSize: _schoolFontSize)),
                  ],
                ),
                ),
              ),
              pw.Positioned(
                left: _tablePos.dx,
                top: _tablePos.dy,
                child: pw.Container(
                  width: _tableSize.width,
                  height: _tableSize.height,
                  decoration: pw.BoxDecoration(
                      border: pw.Border.all(color: PdfColors.black)),
                  child: pw.Column(
                    children: [
                      pw.Row(
                        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                        children: [
                          pw.Text('Subject'),
                          pw.Text('Max'),
                          pw.Text('Obtained')
                        ],
                      ),
                      pw.Divider(),
                      pw.Text('Mathematics ...'),
                      if (_showAttendance) ...[
                        pw.Divider(),
                        pw.Text('Attendance: 90%'),
                      ]
                    ],
                  ),
                ),
              ),
              pw.Positioned(
                left: _footerPos.dx,
                top: _footerPos.dy,
                child: pw.Container(
                  width: _footerSize.width,
                  height: _footerSize.height,
                  child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(_disclaimer, style: const pw.TextStyle(fontSize: 10)),
                    pw.SizedBox(height: 10),
                    if (_showSignature)
                      pw.Align(
                        alignment: pw.Alignment.bottomRight,
                        child: pw.Container(
                        width: 100,
                        height: 40,
                        decoration: const pw.BoxDecoration(
                            border: pw.Border(
                                top: pw.BorderSide(color: PdfColors.black))),
                        child: pw.Center(child: pw.Text('Principal Signature')),
                      )),
                  ],
                ),
                ),
              ),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
        onLayout: (PdfPageFormat format) async => doc.save());
  }
}
