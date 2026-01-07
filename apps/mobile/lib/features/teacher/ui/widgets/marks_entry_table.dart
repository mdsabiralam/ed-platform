import 'package:flutter/material.dart';

class MarksEntryTable extends StatefulWidget {
  final List<String> studentIds;
  final Function(Map<String, double>) onSaved;

  const MarksEntryTable({
    Key? key,
    required this.studentIds,
    required this.onSaved,
  }) : super(key: key);

  @override
  State<MarksEntryTable> createState() => _MarksEntryTableState();
}

class _MarksEntryTableState extends State<MarksEntryTable> {
  final Map<String, TextEditingController> _controllers = {};
  final Map<String, FocusNode> _focusNodes = {};
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    for (var id in widget.studentIds) {
      _controllers[id] = TextEditingController();
      _focusNodes[id] = FocusNode();
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) controller.dispose();
    for (var node in _focusNodes.values) node.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final marks = <String, double>{};
      _controllers.forEach((id, controller) {
        if (controller.text.isNotEmpty) {
          marks[id] = double.tryParse(controller.text) ?? 0.0;
        }
      });
      widget.onSaved(marks);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          Expanded(
            child: ListView.separated(
              itemCount: widget.studentIds.length,
              separatorBuilder: (context, index) => Divider(height: 1),
              itemBuilder: (context, index) {
                final id = widget.studentIds[index];
                final isLast = index == widget.studentIds.length - 1;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Text(
                          'Student ${index + 1}', // Placeholder name
                          style: TextStyle(fontWeight: FontWeight.w500),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: TextFormField(
                          controller: _controllers[id],
                          focusNode: _focusNodes[id],
                          keyboardType: TextInputType.number,
                          textInputAction: isLast ? TextInputAction.done : TextInputAction.next,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            isDense: true,
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) return null;
                            final mark = double.tryParse(value);
                            if (mark == null) return 'Invalid';
                            if (mark > 100) return '>100';
                            return null;
                          },
                          onFieldSubmitted: (_) {
                            if (!isLast) {
                              FocusScope.of(context).requestFocus(_focusNodes[widget.studentIds[index + 1]]);
                            } else {
                              _submit();
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: _submit,
              child: Text('Save Marks'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 48),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
