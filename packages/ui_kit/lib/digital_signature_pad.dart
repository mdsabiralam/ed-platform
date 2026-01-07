import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:signature/signature.dart';

class DigitalSignaturePad extends StatefulWidget {
  final Function(Uint8List) onConfirm;

  const DigitalSignaturePad({Key? key, required this.onConfirm}) : super(key: key);

  @override
  _DigitalSignaturePadState createState() => _DigitalSignaturePadState();
}

class _DigitalSignaturePadState extends State<DigitalSignaturePad> {
  final SignatureController _controller = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _exportSignature() async {
    if (_controller.isNotEmpty) {
      final Uint8List? data = await _controller.toPngBytes();
      if (data != null) {
        widget.onConfirm(data);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Signature(
            controller: _controller,
            width: double.infinity,
            height: 200,
            backgroundColor: Colors.white,
          ),
        ),
        const SizedBox(height: 16.0),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            ElevatedButton.icon(
              onPressed: () => _controller.clear(),
              icon: const Icon(Icons.clear),
              label: const Text('Clear'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            ),
            ElevatedButton.icon(
              onPressed: _exportSignature,
              icon: const Icon(Icons.check),
              label: const Text('Confirm'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            ),
          ],
        ),
      ],
    );
  }
}
