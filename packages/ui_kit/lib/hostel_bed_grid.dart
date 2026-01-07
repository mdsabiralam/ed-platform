import 'package:flutter/material.dart';

enum BedStatus {
  available,
  occupied,
  maintenance,
}

class BedModel {
  final String id;
  final String roomNumber;
  final BedStatus status;
  final String? studentName;

  BedModel({
    required this.id,
    required this.roomNumber,
    required this.status,
    this.studentName,
  });
}

class HostelBedGrid extends StatelessWidget {
  final List<BedModel> beds;
  final Function(BedModel) onBedTap;

  const HostelBedGrid({
    Key? key,
    required this.beds,
    required this.onBedTap,
  }) : super(key: key);

  Color _getColor(BedStatus status) {
    switch (status) {
      case BedStatus.available:
        return Colors.green;
      case BedStatus.occupied:
        return Colors.red;
      case BedStatus.maintenance:
        return Colors.yellow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(8.0),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.0,
        crossAxisSpacing: 8.0,
        mainAxisSpacing: 8.0,
      ),
      itemCount: beds.length,
      itemBuilder: (context, index) {
        final bed = beds[index];
        return InkWell(
          onTap: () {
            if (bed.status == BedStatus.occupied && bed.studentName != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Occupied by: ${bed.studentName}')),
              );
            } else if (bed.status == BedStatus.available) {
              onBedTap(bed);
            }
          },
          child: Container(
            decoration: BoxDecoration(
              color: _getColor(bed.status),
              borderRadius: BorderRadius.circular(8.0),
              border: Border.all(color: Colors.black12),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.bed, color: Colors.white),
                  const SizedBox(height: 4.0),
                  Text(
                    bed.roomNumber,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
