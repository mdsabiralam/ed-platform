import 'package:flutter/material.dart';
import '../../core/models/user_role.dart';
import 'screens/teacher_home.dart';
import 'screens/student_home.dart';
import 'screens/parent_home.dart';
import 'screens/admin_command_center.dart';

abstract class DashboardWidget extends StatelessWidget {
  const DashboardWidget({super.key});

  static Widget build(UserRole role) {
    switch (role) {
      case UserRole.teacher:
        return const TeacherHome();
      case UserRole.student:
        return const StudentHome();
      case UserRole.parent:
        return const ParentHome();
      case UserRole.superAdmin:
      case UserRole.admin: // Mapping both to Admin for now
      case UserRole.principal: // Mapping both to Admin for now
      case UserRole.headmaster: // Mapping both to Admin for now
        return const AdminCommandCenter();
      default:
        // Default fallback or a specific "Unauthorized" / "Generic" dashboard
        // For now, let's return StudentHome or a generic Placeholder
        return const Center(child: Text('Unknown Role Dashboard'));
    }
  }
}
