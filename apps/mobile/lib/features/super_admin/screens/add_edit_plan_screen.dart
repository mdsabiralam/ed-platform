import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AddEditPlanScreen extends StatefulWidget {
  final String? planId;
  const AddEditPlanScreen({super.key, this.planId});

  @override
  State<AddEditPlanScreen> createState() => _AddEditPlanScreenState();
}

class _AddEditPlanScreenState extends State<AddEditPlanScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  String _currency = 'USD';
  String _interval = 'Monthly';
  final List<TextEditingController> _featureControllers = [TextEditingController()];

  bool get isEditMode => widget.planId != null;

  @override
  void initState() {
    super.initState();
    if (isEditMode) {
      _nameController.text = 'Gold Plan';
      _priceController.text = '49.99';
    }
  }

  void _addFeature() {
    setState(() {
      _featureControllers.add(TextEditingController());
    });
  }

  void _removeFeature(int index) {
    setState(() {
      _featureControllers.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditMode ? 'Edit Plan' : 'New Plan'),
        backgroundColor: const Color(0xFF0D47A1),
        foregroundColor: Colors.white,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          Widget content = SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Plan Name',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) => value!.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _priceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Price',
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) => value!.isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _currency,
                          decoration: const InputDecoration(
                            labelText: 'Currency',
                            border: OutlineInputBorder(),
                          ),
                          items: ['USD', 'BDT', 'INR'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                          onChanged: (val) => setState(() => _currency = val!),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _interval,
                    decoration: const InputDecoration(
                      labelText: 'Billing Interval',
                      border: OutlineInputBorder(),
                    ),
                    items: ['Monthly', 'Yearly'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                    onChanged: (val) => setState(() => _interval = val!),
                  ),
                  const SizedBox(height: 24),
                  const Text('Features', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ..._featureControllers.asMap().entries.map((entry) {
                    final index = entry.key;
                    final controller = entry.value;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: controller,
                              decoration: InputDecoration(
                                labelText: 'Feature ${index + 1}',
                                border: const OutlineInputBorder(),
                              ),
                              validator: (val) => val!.isEmpty ? 'Required' : null,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => _removeFeature(index),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  OutlinedButton.icon(
                    onPressed: _addFeature,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Feature'),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Plan Saved')));
                        context.pop();
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFF0D47A1),
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Save Plan'),
                  ),
                ],
              ),
            ),
          );

          if (constraints.maxWidth > 800) {
            return Center(
              child: Card(
                elevation: 4,
                margin: const EdgeInsets.all(32),
                child: SizedBox(width: 700, child: content),
              ),
            );
          }
          return content;
        },
      ),
    );
  }
}
