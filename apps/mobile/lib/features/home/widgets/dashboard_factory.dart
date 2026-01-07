import 'package:flutter/material.dart';
import 'package:mobile/core/models/user_role.dart';
import 'package:mobile/features/home/widgets/teacher_home_widget.dart';
import 'package:mobile/features/home/widgets/parent_home_widget.dart';
import 'package:mobile/features/home/widgets/admin_home_widget.dart';

class DashboardFactory {
  static Widget build(UserRole role) {
    switch (role) {
      case UserRole.teacher:
        return const TeacherHomeWidget();
      case UserRole.parent:
        return const ParentHomeWidget();
      case UserRole.admin:
      case UserRole.superAdmin:
      case UserRole.principal:
        return const AdminHomeWidget();
      default:
        // Default fallbacks
        return const TeacherHomeWidget(); // For demo purposes defaulting to teacher if unknown
    }
  }
}
