import 'package:flutter/material.dart';

class HealthVitalsScreen extends StatefulWidget {
  const HealthVitalsScreen({super.key});

  @override
  State<HealthVitalsScreen> createState() => _HealthVitalsScreenState();
}

class _HealthVitalsScreenState extends State<HealthVitalsScreen> {
  double _height = 150; // cm
  double _weight = 45; // kg
  double get _bmi => _weight / ((_height / 100) * (_height / 100));

  String get _bmiStatus {
    if (_bmi < 18.5) return 'Underweight';
    if (_bmi < 25) return 'Healthy';
    if (_bmi < 30) return 'Overweight';
    return 'Obese';
  }

  Color get _statusColor {
    if (_bmi < 18.5) return Colors.orange;
    if (_bmi < 25) return Colors.green;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Vitals Update'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return Center(child: SizedBox(width: 600, child: Card(child: Padding(padding: const EdgeInsets.all(32), child: _buildContent()))));
          }
          return SingleChildScrollView(padding: const EdgeInsets.all(16), child: _buildContent());
        },
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('Update Vitals: John Doe', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Height (cm)'),
            Text('${_height.round()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        Slider(
          value: _height,
          min: 100,
          max: 200,
          activeColor: Colors.blue,
          onChanged: (v) => setState(() => _height = v),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Weight (kg)'),
            Text('${_weight.round()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        Slider(
          value: _weight,
          min: 20,
          max: 120,
          activeColor: Colors.blue,
          onChanged: (v) => setState(() => _weight = v),
        ),
        const SizedBox(height: 32),
        // BMI Gauge Mock
        Center(
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: _statusColor, width: 8),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('BMI', style: TextStyle(color: Colors.grey)),
                Text(_bmi.toStringAsFixed(1), style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: _statusColor)),
                Text(_bmiStatus, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _statusColor)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),
        if (_bmi < 18.5 || _bmi > 25)
          const Card(
            color: Colors.redAccent,
            child: Padding(
              padding: EdgeInsets.all(8.0),
              child: Text(
                'Anomaly Detected: BMI deviates from standard growth chart. Please consult a doctor.',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vitals Updated Successfully')));
            Navigator.pop(context);
          },
          style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white, padding: const EdgeInsets.all(16)),
          child: const Text('Save Record'),
        ),
      ],
    );
  }
}
