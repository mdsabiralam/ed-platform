import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HealthDashboardScreen extends StatefulWidget {
  const HealthDashboardScreen({super.key});

  @override
  State<HealthDashboardScreen> createState() => _HealthDashboardScreenState();
}

class _HealthDashboardScreenState extends State<HealthDashboardScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 1.0, end: 1.2).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _triggerSOS() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.red.shade50,
        title: const Text('SOS Alert Sent!', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        content: const Text('Emergency notification sent to Admin and Principal. Stay calm.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Dismiss', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Infirmary Dashboard'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.red,
        elevation: 1,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return _buildWebLayout();
          }
          return _buildMobileLayout();
        },
      ),
    );
  }

  Widget _buildMobileLayout() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildSOSButton(),
          const SizedBox(height: 24),
          _buildStockAlert(),
          const SizedBox(height: 24),
          _buildVisitsList(),
        ],
      ),
    );
  }

  Widget _buildWebLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                _buildSOSButton(),
                const SizedBox(height: 32),
                _buildStockAlert(),
              ],
            ),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 7,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Analytics & Visits', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Container(
                  height: 200,
                  color: Colors.grey.shade100,
                  child: const Center(child: Text('Chart: Sickness Trends by Class')),
                ),
                const SizedBox(height: 24),
                Expanded(child: _buildVisitsList()),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSOSButton() {
    return GestureDetector(
      onLongPress: _triggerSOS,
      child: ScaleTransition(
        scale: _animation,
        child: Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: Colors.red,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: Colors.red.withOpacity(0.5), blurRadius: 20, spreadRadius: 5),
            ],
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.white, size: 40),
              Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStockAlert() {
    return Card(
      color: Colors.orange.shade50,
      child: const ListTile(
        leading: Icon(Icons.inventory, color: Colors.orange),
        title: Text('Low Stock Alert'),
        subtitle: Text('Paracetamol (5 strips left)\nBandages (2 rolls left)'),
      ),
    );
  }

  Widget _buildVisitsList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("Today's Visits", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            IconButton(onPressed: () => context.go('/health/opd'), icon: const Icon(Icons.add_circle, color: Colors.blue)),
          ],
        ),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 5,
          itemBuilder: (context, index) {
            return Card(
              child: ListTile(
                leading: CircleAvatar(child: Text('${index + 1}')),
                title: Text('Student Name ${index + 1}'),
                subtitle: const Text('Class 5-A • Fever'),
                trailing: const Text('10:30 AM'),
              ),
            );
          },
        ),
      ],
    );
  }
}
