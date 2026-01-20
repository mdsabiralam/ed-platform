import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ParentPaymentGatewayScreen extends StatefulWidget {
  const ParentPaymentGatewayScreen({super.key});

  @override
  State<ParentPaymentGatewayScreen> createState() =>
      _ParentPaymentGatewayScreenState();
}

class _ParentPaymentGatewayScreenState
    extends State<ParentPaymentGatewayScreen> {
  String _selectedMethod = 'Credit Card';
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Gateway'),
        backgroundColor: Colors.teal,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Total Amount',
              style: GoogleFonts.lato(fontSize: 16, color: Colors.grey),
            ),
            Text(
              '\$1500.00',
              style: GoogleFonts.lato(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Select Payment Method',
              style: GoogleFonts.lato(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildPaymentMethod('Credit Card', Icons.credit_card),
            _buildPaymentMethod('Mobile Banking', Icons.phone_android),
            _buildPaymentMethod('Bank Transfer', Icons.account_balance),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isProcessing
                    ? null
                    : () async {
                        setState(() => _isProcessing = true);
                        await Future.delayed(const Duration(seconds: 2));
                        if (mounted) {
                          setState(() => _isProcessing = false);
                          showDialog(
                            context: context,
                            barrierDismissible: false,
                            builder: (context) => AlertDialog(
                              title: const Text('Payment Receipt'),
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Center(
                                    child: Icon(
                                      Icons.check_circle,
                                      color: Colors.green,
                                      size: 50,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'Payment Successful!',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const Divider(),
                                  const Text('Transaction ID: TXN123456789'),
                                  const Text('Date: 2023-10-27'),
                                  const Text('Amount: \$1500.00'),
                                  Text('Method: $_selectedMethod'),
                                ],
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.pop(context); // Close Dialog
                                    Navigator.pop(context); // Go Back
                                  },
                                  child: const Text('Close'),
                                ),
                              ],
                            ),
                          );
                        }
                      },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                child: _isProcessing
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Pay Now', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethod(String name, IconData icon) {
    return RadioListTile<String>(
      value: name,
      groupValue: _selectedMethod,
      onChanged: (value) => setState(() => _selectedMethod = value!),
      title: Text(name, style: GoogleFonts.lato()),
      secondary: Icon(icon, color: Colors.teal),
      activeColor: Colors.teal,
    );
  }
}
