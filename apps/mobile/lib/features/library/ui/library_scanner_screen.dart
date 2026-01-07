import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:mobile/core/api_client.dart';

// 12.G.04 Librarian App (ISBN Scanner)
// 12.G.05 Issue/Return Workflow

class LibraryScannerScreen extends StatefulWidget {
  const LibraryScannerScreen({Key? key}) : super(key: key);

  @override
  State<LibraryScannerScreen> createState() => _LibraryScannerScreenState();
}

class _LibraryScannerScreenState extends State<LibraryScannerScreen> {
  String? bookId;
  String? studentId;
  int currentStep = 1; // 1: Scan Book, 2: Scan Student
  bool isProcessing = false;

  void _onCodeDetected(BarcodeCapture capture) {
    if (isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final String? code = barcode.rawValue;
      if (code != null) {
        setState(() {
          isProcessing = true; // Pause scanning logic
        });

        // 12.G.04 Callback
        _handleScan(code);
        break;
      }
    }
  }

  void _handleScan(String code) {
    if (currentStep == 1) {
      // Step 1: Book Scanned
      // Here we would verify if it is ISBN (EAN-13) or Accession (Barcode)
      // For now, accept any and move to next step
      setState(() {
        bookId = code;
        currentStep = 2;
        isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Book Scanned: $code")));
    } else if (currentStep == 2) {
      // Step 2: Student Scanned
      setState(() {
        studentId = code;
        isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Student Scanned: $code")));
    }
  }

  void _confirmIssue() async {
    if (bookId != null && studentId != null) {
      // Call API to register transaction
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Issuing Book...")));

      final apiClient = ApiClient();
      try {
        await apiClient.post('/library/issue', data: {
          'bookId': bookId, // Could be ISBN or Accession, backend logic resolves
          'studentId': studentId,
          'date': DateTime.now().toIso8601String(),
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Book Issued Successfully!")));
          // Reset
          setState(() {
            bookId = null;
            studentId = null;
            currentStep = 1;
          });
        }
      } catch (e) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Issue Failed: $e")));
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Library Scanner")),
      body: Column(
        children: [
          // 12.G.05 UI with two steps
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    color: currentStep == 1 ? Colors.blueAccent.withOpacity(0.2) : Colors.transparent,
                    child: Column(
                      children: [
                        const Icon(Icons.book),
                        const Text("1. Scan Book"),
                        if (bookId != null) Text(bookId!, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    color: currentStep == 2 ? Colors.blueAccent.withOpacity(0.2) : Colors.transparent,
                    child: Column(
                      children: [
                        const Icon(Icons.person),
                        const Text("2. Scan Student"),
                        if (studentId != null) Text(studentId!, style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            flex: 2,
            child: studentId == null ? MobileScanner(
              // 12.G.04 Configure camera
              onDetect: _onCodeDetected,
              // formats: [BarcodeFormat.ean13, BarcodeFormat.code128, BarcodeFormat.qrCode], // Optional filter
            ) : Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 64),
                  const SizedBox(height: 16),
                  Text("Ready to Issue", style: Theme.of(context).textTheme.headlineSmall),
                ],
              ),
            ),
          ),

          if (bookId != null && studentId != null)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _confirmIssue,
                  child: const Text("CONFIRM ISSUE"),
                ),
              ),
            ),

           if (bookId != null && studentId == null)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: TextButton(
                onPressed: () {
                   setState(() {
                     bookId = null;
                     currentStep = 1;
                   });
                },
                child: const Text("Reset")
              ),
            )
        ],
      ),
    );
  }
}
