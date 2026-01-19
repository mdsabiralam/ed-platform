import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final chats = List.generate(5, (index) => 'Parent of Student ${index + 1}');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.teal,
      ),
      body: ListView.builder(
        itemCount: chats.length,
        itemBuilder: (context, index) {
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.teal.shade100,
              child: const Icon(Icons.person, color: Colors.teal),
            ),
            title: Text(chats[index]),
            subtitle: const Text('Last message preview...'),
            trailing: const Text('10:00 AM', style: TextStyle(color: Colors.grey, fontSize: 12)),
            onTap: () {
               context.push('/chat/details', extra: {'name': chats[index]});
            },
          );
        },
      ),
    );
  }
}
