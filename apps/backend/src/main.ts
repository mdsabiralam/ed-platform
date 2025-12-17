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
          title: const Text('ed Platform'), // ছোট হাতের 'ed'
          backgroundColor: Colors.blueAccent,
        ),
        body: const Center(
          child: Text(
            'Welcome to ed Platform!', // ছোট হাতের 'ed'
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}