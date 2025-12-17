import 'package:flutter/material.dart';

void main() {
  runApp(const EdApp());
}

class EdApp extends StatelessWidget {
  const EdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        appBar: AppBar(
          title: const Text('ed Platform'),
          backgroundColor: Colors.blueAccent,
        ),
        body: const Center(
          child: Text(
            'Welcome to ed Platform!',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}