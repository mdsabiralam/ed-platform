import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

class FeePaymentScreen extends StatefulWidget {
  final double amount;
  final String invoiceId;
  final String studentName;

  const FeePaymentScreen({
    Key? key,
    required this.amount,
    required this.invoiceId,
    required this.studentName,
  }) : super(key: key);

  @override
  State<FeePaymentScreen> createState() => _FeePaymentScreenState();
}

class _FeePaymentScreenState extends State<FeePaymentScreen> {
  late Razorpay _razorpay;
  bool _isProcessing = false;
  String _paymentStatus = 'Pending';

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _openCheckout() async {
    setState(() {
      _isProcessing = true;
    });

    // 1. Call backend to get order_id (Simulated)
    // final orderId = await backend.createOrder(widget.amount);
    final orderId = "order_simulated_${DateTime.now().millisecondsSinceEpoch}";
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

    var options = {
      'key': 'rzp_test_1234567890', // Replace with actual key from config
      'amount': (widget.amount * 100).toInt(), // in paise
      'name': 'EduMatrix School',
      'description': 'Fee Payment for ${widget.studentName}',
      'order_id': orderId, // Generate order_id using Orders API
      'timeout': 300, // in seconds
      'prefill': {
        'contact': '9876543210',
        'email': 'parent@example.com'
      }
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error: $e');
      setState(() {
        _isProcessing = false;
        _paymentStatus = 'Error launching payment';
      });
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    // 3. Call backend verification endpoint
    // await backend.verifyPayment(response.paymentId, response.signature, ...);

    setState(() {
      _isProcessing = false;
      _paymentStatus = 'Paid (ID: ${response.paymentId})';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Payment Successful!"), backgroundColor: Colors.green),
    );

    // Notify parent widgets / Cubit to refresh fee status
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    setState(() {
      _isProcessing = false;
      _paymentStatus = 'Failed: ${response.message}';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Payment Failed: ${response.message}"), backgroundColor: Colors.red),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    setState(() {
      _isProcessing = false;
      _paymentStatus = 'External Wallet Selected: ${response.walletName}';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pay Fees')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Invoice #${widget.invoiceId}', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 10),
                    Text('Student: ${widget.studentName}', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 20),
                    Text(
                      '\$${widget.amount.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),
            Text('Status: $_paymentStatus', textAlign: TextAlign.center),
            const Spacer(),
            ElevatedButton(
              onPressed: _isProcessing || _paymentStatus.startsWith('Paid') ? null : _openCheckout,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.blue,
              ),
              child: _isProcessing
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('PAY NOW', style: TextStyle(fontSize: 18, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
