import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Welcome to Ed Platform', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              const TextField(decoration: InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
              const SizedBox(height: 16),
              const TextField(decoration: InputDecoration(labelText: 'Password', border: OutlineInputBorder()), obscureText: true),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => context.go('/super-admin'), // Mock Login
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                child: const Text('Login as Super Admin'),
              ),
              TextButton(onPressed: () => context.go('/principal/dashboard'), child: const Text('Login as Principal')),
              TextButton(onPressed: () => context.go('/staff'), child: const Text('Login as Staff')),
              TextButton(onPressed: () => context.go('/student/list'), child: const Text('Login as Student')),
            ],
          ),
        ),
      ),
    );
  }
}
