import 'package:flutter/material.dart';
import 'package:mobile/core/models/profile.dart';

class ProfileSwitcherSheet extends StatelessWidget {
  final List<Profile> profiles;
  final Function(String) onProfileSelected;

  const ProfileSwitcherSheet({
    super.key,
    required this.profiles,
    required this.onProfileSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select Profile',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: profiles.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final profile = profiles[index];
              return ListTile(
                leading: CircleAvatar(
                  child: Text(profile.name[0].toUpperCase()),
                ),
                title: Text(profile.name),
                subtitle: Text(profile.role),
                onTap: () => onProfileSelected(profile.id),
              );
            },
          ),
        ],
      ),
    );
  }
}
