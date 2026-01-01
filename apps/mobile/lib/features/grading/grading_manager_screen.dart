import 'package:flutter/material.dart';
import 'grading_models.dart';
import 'grading_repository.dart';

class GradingManagerScreen extends StatefulWidget {
  const GradingManagerScreen({super.key});

  @override
  State<GradingManagerScreen> createState() => _GradingManagerScreenState();
}

class _GradingManagerScreenState extends State<GradingManagerScreen> {
  final String _tenantId = 'ce58f250-8384-4af5-8c83-726746179b09';
  late final GradingRepository _repository;
  List<GradingScale>? _scales;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _repository = GradingRepository(tenantId: _tenantId);
    _loadScales();
  }

  Future<void> _loadScales() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final scales = await _repository.getScales();
      setState(() {
        _scales = scales;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Grading Manager')),
        body: Center(child: Text('Error: $_error')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Grading Manager')),
      body: ListView.builder(
        itemCount: _scales?.length ?? 0,
        itemBuilder: (context, index) {
          final scale = _scales![index];
          return ListTile(
            title: Text(scale.name),
            subtitle: Text(scale.isMarksBased ? 'Marks Based' : 'Co-Scholastic'),
            trailing: const Icon(Icons.edit),
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => GradingEditScreen(scale: scale, repository: _repository),
                ),
              );
              _loadScales();
            },
          );
        },
      ),
    );
  }
}

class GradingEditScreen extends StatefulWidget {
  final GradingScale scale;
  final GradingRepository repository;

  const GradingEditScreen({super.key, required this.scale, required this.repository});

  @override
  State<GradingEditScreen> createState() => _GradingEditScreenState();
}

class _GradingEditScreenState extends State<GradingEditScreen> {
  late List<GradingLogic> _logics;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _logics = widget.scale.gradingLogics.map((l) => GradingLogic(
      id: l.id,
      label: l.label,
      minScore: l.minScore,
      maxScore: l.maxScore,
      gradePoint: l.gradePoint
    )).toList();

    // Sort logic by maxScore desc for better view
    _logics.sort((a, b) => (b.maxScore ?? 0).compareTo(a.maxScore ?? 0));
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updatedScale = GradingScale(
        id: widget.scale.id,
        name: widget.scale.name,
        isMarksBased: widget.scale.isMarksBased,
        tenantId: widget.scale.tenantId,
        gradingLogics: _logics,
      );
      await widget.repository.updateScale(updatedScale);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _addRow() {
    setState(() {
      _logics.insert(0, GradingLogic(
        id: 'new-${DateTime.now().millisecondsSinceEpoch}',
        label: '',
        minScore: 0,
        maxScore: 0,
        gradePoint: 0,
      ));
    });
  }

  void _removeRow(int index) {
    setState(() {
        _logics.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Edit: ${widget.scale.name}'),
        actions: [
          IconButton(
            icon: _saving ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.save),
            onPressed: _saving ? null : _save,
          )
        ],
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('Label')),
              DataColumn(label: Text('Min')),
              DataColumn(label: Text('Max')),
              DataColumn(label: Text('GP')),
              DataColumn(label: Text('Action')),
            ],
            rows: _logics.asMap().entries.map((entry) {
              final index = entry.key;
              final logic = entry.value;
              return DataRow(cells: [
                DataCell(SizedBox(width: 50, child: TextFormField(
                  initialValue: logic.label,
                  onChanged: (v) => _logics[index] = GradingLogic(
                      id: logic.id, label: v, minScore: logic.minScore, maxScore: logic.maxScore, gradePoint: logic.gradePoint),
                ))),
                DataCell(SizedBox(width: 50, child: TextFormField(
                  initialValue: logic.minScore?.toString() ?? '',
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _logics[index] = GradingLogic(
                      id: logic.id, label: logic.label, minScore: double.tryParse(v), maxScore: logic.maxScore, gradePoint: logic.gradePoint),
                ))),
                DataCell(SizedBox(width: 50, child: TextFormField(
                  initialValue: logic.maxScore?.toString() ?? '',
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _logics[index] = GradingLogic(
                      id: logic.id, label: logic.label, minScore: logic.minScore, maxScore: double.tryParse(v), gradePoint: logic.gradePoint),
                ))),
                DataCell(SizedBox(width: 50, child: TextFormField(
                  initialValue: logic.gradePoint.toString(),
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _logics[index] = GradingLogic(
                      id: logic.id, label: logic.label, minScore: logic.minScore, maxScore: logic.maxScore, gradePoint: double.tryParse(v) ?? 0),
                ))),
                DataCell(IconButton(icon: const Icon(Icons.delete), onPressed: () => _removeRow(index))),
              ]);
            }).toList(),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addRow,
        child: const Icon(Icons.add),
      ),
    );
  }
}
