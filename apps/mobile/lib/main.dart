import 'dart:convert';
import 'package:mobile/core/models/plan.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const EdApp());
}

class EdApp extends StatelessWidget {
  const EdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ed Platform',
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const PlanListScreen(),
    );
  }
}

class PlanListScreen extends StatefulWidget {
  const PlanListScreen({super.key});

  @override
  State<PlanListScreen> createState() => _PlanListScreenState();
}

class _PlanListScreenState extends State<PlanListScreen> {
  List<Plan> plans = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchPlans();
  }

  // ডাটা আনার ফাংশন
  Future<void> fetchPlans() async {
    try {
      // Android Emulator এর জন্য 10.0.2.2 ব্যবহার করতে হয়
      final url = Uri.parse('http://localhost:3001/api/saas/plans');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          plans = data.map((json) => Plan.fromJson(json)).toList();
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load plans');
      }
    } catch (e) {
      debugPrint("Error: $e");
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Subscription Plans')),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: plans.length,
              itemBuilder: (context, index) {
                final plan = plans[index];
                return Card(
                  margin: const EdgeInsets.all(8.0),
                  child: ListTile(
                    title: Text(
                      plan.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      plan.features.join(", "),
                    ), // এটি সঠিক (সব ফিচার কমা দিয়ে দেখাবে)
                    trailing: Text(
                      "৳${plan.priceMonthly}",
                      style: const TextStyle(color: Colors.green, fontSize: 16),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
