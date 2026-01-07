import 'package:flutter/material.dart';

class PrincipalDashboard extends StatelessWidget {
  const PrincipalDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Principal Command Center')),
      body: Center(
        child: Text('Use specific widgets directly'),
      ),
    );
  }
}
