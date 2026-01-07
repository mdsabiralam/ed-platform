import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class SkeletonListTile extends StatelessWidget {
  const SkeletonListTile({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListTile(
        leading: const CircleAvatar(
          backgroundColor: Colors.white,
          radius: 24,
        ),
        title: Container(
          width: double.infinity,
          height: 16.0,
          color: Colors.white,
        ),
        subtitle: Container(
          width: double.infinity,
          height: 12.0,
          color: Colors.white,
          margin: const EdgeInsets.only(top: 4.0),
        ),
      ),
    );
  }
}
