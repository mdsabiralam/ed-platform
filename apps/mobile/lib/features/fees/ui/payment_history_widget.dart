import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

class PaymentHistoryWidget extends StatefulWidget {
  const PaymentHistoryWidget({Key? key}) : super(key: key);

  @override
  State<PaymentHistoryWidget> createState() => _PaymentHistoryWidgetState();
}

class _PaymentHistoryWidgetState extends State<PaymentHistoryWidget> {
  // Mock Data
  final List<Map<String, dynamic>> _invoices = [
    {'id': 'INV-2024-001', 'amount': 500.0, 'date': '2024-01-15', 'status': 'PAID', 'url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},
    {'id': 'INV-2024-002', 'amount': 500.0, 'date': '2024-02-15', 'status': 'PENDING', 'url': null},
  ];

  Future<void> _downloadInvoice(String url, String invoiceId) async {
    // Permission check for Android < 13. Android 13+ doesn't need WRITE_EXTERNAL_STORAGE for app-specific dirs or uses scoped storage.
    if (Platform.isAndroid) {
        // For simple download to app storage, we often don't need explicit permission on modern Android
        // But if we wanted to save to public Downloads, we might.
        // Let's assume saving to app temporary directory for immediate viewing.
    }

    try {
      final dir = await getApplicationDocumentsDirectory();
      final filePath = '${dir.path}/$invoiceId.pdf';

      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Downloading...")));

      await Dio().download(url, filePath);

      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Download Complete! Opening...")));

      final result = await OpenFile.open(filePath);
      if (result.type != ResultType.done) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Could not open file: ${result.message}")));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _invoices.length,
      itemBuilder: (context, index) {
        final invoice = _invoices[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: const Icon(Icons.receipt),
            title: Text("Invoice #${invoice['id']}"),
            subtitle: Text("${invoice['date']} - \$${invoice['amount']}"),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  invoice['status'],
                  style: TextStyle(
                    color: invoice['status'] == 'PAID' ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (invoice['status'] == 'PAID' && invoice['url'] != null)
                  IconButton(
                    icon: const Icon(Icons.download),
                    onPressed: () => _downloadInvoice(invoice['url'], invoice['id']),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
